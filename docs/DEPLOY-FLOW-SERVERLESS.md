# 🔄 FLOW DEPLOY SERVERLESS — InfinityFree + Supabase + Cloudinary (Renmoku)

> Dokumen ini adalah **flow operasional** (langkah-demi-langkah siap eksekusi).
> Konsep arsitektur & rationale: lihat `PRODUCTION-READINESS-DESIGN-CONCEPT.md`.
> Versi detail setup akun per layanan: `DEPLOYMENT-INFINITYFREE.md`.

---

## 0. Prinsip Kerja Serverless di Stack Ini

```
            ┌──────────────────────────────────────────────────────┐
 Browser ──▶│ INFINITYFREE (Apache/PHP shared hosting)             │
            │  hanya menyajikan STATIC FILE: index.html + assets  │
            └───────────────┬──────────────────────────────────────┘
                            │ JS bundle berjalan DI BROWSER (bukan di server!)
        ┌───────────────────┼───────────────────────┐
        ▼ HTTPS (PostgREST) ▼ WebSocket (Realtime)  ▼ HTTPS (Upload API unsigned)
 ┌──────────────┐    ┌──────────────┐       ┌───────────────┐
 │  SUPABASE    │    │  SUPABASE    │       │  CLOUDINARY   │
 │ DB+Auth+RLS  │    │  Realtime    │       │ media publik  │
 │ Edge Fn (webhook/payment/KYC-sign)        │ (image CDN)   │
 └──────────────┘    └──────────────┘       └───────────────┘
```

**Kunci serverless:** InfinityFree TIDAK menjalankan logika apa pun (tidak ada Node.js). Seluruh "backend" pindah ke Supabase (data, auth, realtime, fungsi) dan Cloudinary (media). Deploy = build statis → upload. Tidak ada proses, tidak ada server yang perlu di-restart.

**Artefak yang sudah tersedia di repo untuk mendukung flow ini:**
- `public/.htaccess` — SPA fallback, cache, kompresi, security headers (otomatis ikut ke `dist/`)
- `scripts/deploy.sh` — quality gate + build + packing + (opsional) upload FTP otomatis
- `supabase/schema.sql` — schema + RLS; jalankan via SQL Editor Supabase

---

## 1. Pre-flight Checklist (sebelum menyentuh dashboard mana pun)

| # | Item | Verifikasi |
|---|------|-----------|
| 1 | `.env` lokal terisi (dari `.env.example`) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_CLOUDINARY_*` bukan placeholder |
| 2 | `service_role` key TIDAK pernah ditulis dengan prefix `VITE_` | grep di `.env`: hanya dipakai di Supabase Dashboard/Edge Functions |
| 3 | Domain InfinityFree aktif (atau subdomain `*.infinityfreeapp.com`) | bisa diakses default page |
| 4 | Akun Supabase region **Singapore (ap-southeast-1)** | latensi terendah dari ID |
| 5 | Akun Cloudinary free tier aktif | ±25 credit/bulan |
| 6 | App URL OAuth/CORS didaftarkan | Supabase Auth → URL Configuration = domain InfinityFree |

---

## 2. Fase A — Provisioning Supabase (sekali per proyek, ±20 menit)

```
A1 Buat project  ➜  A2 Jalankan schema.sql  ➜  A3 Aktifkan Auth Email
                 ➜  A4 Konfirmasi RLS ON    ➜  A5 Buat bucket privat kyc-documents
                 ➜  A6 Deploy Edge Functions ➜  A7 Catat anon key + project URL
```

**Langkah detail:**

1. **A1** — [supabase.com/dashboard](https://supabase.com/dashboard) → *New Project* → nama `renmoku`, region Singapore, plan Free. Simpan **Database password**.
2. **A2** — Buka **SQL Editor** → paste isi `supabase/schema.sql` → **Run**. Cek **Table Editor**: `profiles, vehicles, bookings, payments, reviews, vehicle_locations, ...` terbentuk.
3. **A3** — **Authentication → Providers → Email**: Enable. Matikan "Confirm email" saat uji cepat, nyalakan untuk produksi.
4. **A4** — **Authentication → URL Configuration**:
   - Site URL: `https://domainkamu.infinityfreeapp.com`
   - Redirect URLs: tambahkan URL persis yang sama.
5. **A5** — **Storage → New bucket**:
   - `vehicle-media` → **public** (fallback bila Cloudinary down)
   - `kyc-documents` → **private**, RLS: hanya owner + admin, akses via signed URL ≤60 detik dari Edge Function.
6. **A6** — Edge Functions menggantikan Express backend (`npx supabase functions serve` saat dev):
   - `payment-webhook` — terima callback Midtrans (verifikasi signature + idempotency), update status booking. **Panggil dengan service role.**
   - `get-kyc-signed-url` — generate signed URL dokumen KYC (admin only).
   - `check-quota` — baca tabel `quota_usage`, balas sisa kuota supaya UI bisa tampilkan banner fair-use sebelum request gagal.
   - Deploy: `supabase functions deploy <nama>` atau paste di dashboard **Edge Functions**.
7. **A7** — **Project Settings → API**: salin **Project URL** dan **anon public key** → isi ke `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). **Service role key hanya masuk ke dashboard/CI secret, tidak pernah ke `.env` frontend.**

> ⚠️ Batas free tier yang harus dipantau: egress 5 GB/bln, 200 concurrent realtime, auto-pause project setelah 7 hari nonaktif (setidaknya cek dashboard tiap minggu).

---

## 3. Fase B — Provisioning Cloudinary (sekali, ±10 menit)

```
B1 Buat account  ➜  B2 Salin cloud_name + api_key  ➜  B3 Buat Upload Preset UNSIGNED
                 ➜  B4 Kunci folder & moderasi     ➜  B5 Isi .env
```

1. **B1–B2** — [console.cloudinary.com](https://cloudinary.com/console) → salin **Cloud name** & **API Key**. (API Secret tidak dipakai oleh browser — jangan pernah dikirim ke client.)
2. **B3** — **Settings → Upload → Upload presets → Add**:
   - Name: `renmoku_preset`, **Signing Mode: Unsigned**
   - Max size: 10 MB; Format: `auto`; Transformation global: `f_auto,q_auto`
   - Folder: `renmoku/`
3. **B4** — Tambahkan **folder-based access control**: preset hanya boleh menulis ke `renmoku/`. Untuk KTP/SIM/dokumen → **jangan ke Cloudinary**; gunakan bucket privat Supabase (Fase A5).
4. **B5** — `.env`:
   ```
   VITE_CLOUDINARY_CLOUD_NAME=dqxxxxxx
   VITE_CLOUDINARY_API_KEY=123456789012345
   VITE_CLOUDINARY_UPLOAD_PRESET=renmoku_preset
   ```

> 💡 Konsumsi transformasi gambar besar-besaran (360° viewer) cepat menghabiskan 25 credit/bulan → pastikan `src/lib/cloudinary.ts` memakai `w_400,f_webp,q_auto` untuk thumbnail dan lazy-load frame viewer.

---

## 4. Fase C — Setup InfinityFree (sekali, ±15 menit + propagasi DNS)

```
C1 Daftar akun ➜ C2 Buat website ➜ C3 Claim domain/subdomain
               ➜ C4 Catat FTP credentials ➜ C5 Aktifkan SSL (Let's Encrypt)
```

1. **C1–C2** — [infinityfree.net](https://www.infinityfree.net/) → registrasi → verifikasi email → **Create a new account/website**.
2. **C3** — Autodomain gratis: `<nama>.infinityfreeapp.com` (atau sambungkan domain TLD sendiri via CNAME — propagasi 24–72 jam).
3. **C4** — Control Panel (client area) → **FTP/MySQL Accounts**: catat
   - FTP host: umumnya `ftpupload.net`
   - Username: `if0_xxxxxxxx`
   - Password: (dibuat saat claim hosting)
   - Document root: **`/htdocs/`**
4. **C5** — **SSL/TLS → Let's Encrypt**: issue sertifikat untuk domain, aktifkan **Force HTTPS**. (Wajib — Supabase Auth menolak redirect http.)
5. Ingat batasan: **tanpa Node.js, tanpa WebSocket server, tanpa cron PHP bebas, fair use ±5 GB bandwidth/hari** — karena itu arsitekturnya static-only + Supabase.

---

## 5. Fase D — Build & Deploy Frontend (diulang setiap rilis, ±5 menit)

### Opsi 1 — Satu perintah (disarankan)

```bash
cp .env.example .env && $EDITOR .env      # sekali saja: isi kredensial
./scripts/deploy.sh                       # typecheck → build → guard → dist-renmoku.zip
```

Script melakukan quality gate otomatis:
- ❌ gagal bila `.env` belum diisi / masih placeholder
- ✅ `npm run typecheck` harus lolos
- ✅ memastikan `dist/.htaccess` ada (SPA fallback + cache + kompresi)
- 🛡️ **blocking** bila terdeteksi `service_role` bocor ke bundle
- 📦 menghasilkan `dist-renmoku.zip` (isi = konten `dist/`, bukan foldernya)

### Opsi 2 — Upload otomatis via FTP

```bash
FTP_HOST=ftpupload.net FTP_USER=if0_xxxxxxxx FTP_PASS='****' \
  ./scripts/deploy.sh --upload
```

(lftp mirror `dist/ → htdocs/`; file lama ikut dibersihkan agar tidak ada chunk yatim.)

### Opsi 3 — Manual (File Manager)

1. Control Panel → **Online File Manager** → buka `/htdocs/` → hapus `index2.html` bawaan.
2. Upload `dist-renmoku.zip` → **Extract** langsung di `/htdocs/` (jangan sampai terbentuk `htdocs/dist/`).
3. Aktifkan *show hidden files* → pastikan `.htaccess` ada di `/htdocs/`.

### Struktur hasil akhir di htdocs/

```
htdocs/
├── .htaccess          ← WAJIB (SPA fallback & cache)
├── index.html
├── assets/index-<hash>.js | .css
├── sw.js, manifest.json, icons/, robots.txt, sitemap.xml
```

---

## 6. Fase E — Smoke Test Pasca-Deploy (wajib, ±10 menit)

| # | Tes | Ekspektasi |
|---|-----|-----------|
| 1 | Buka `https://<domain>/` | Landing tampil, tanpa error console |
| 2 | Hard-refresh di route dalam (mis. `/dashboard`) | **Tidak 404** (bukti `.htaccess` bekerja) |
| 3 | Register login email/password | User muncul di Supabase **Auth → Users** |
| 4 | Login → CRUD booking sederhana | Baris baru di **Table Editor**; RLS menolak akses lintas role (uji dgn akun customer vs admin) |
| 5 | Upload foto mobil | URL Cloudinary `res.cloudinary.com/.../renmoku/...` tampil & ter-optimasi webp |
| 6 | Dua browser terbuka + ubah status booking | Update realtime masuk ≤2 dtk (kalau gagal → fallback polling 15 dtk harus tetap jalan) |
| 7 | DevTools Network tab | Tidak ada request ke `localhost`; header `cache-control: immutable` pada hashed assets |
| 8 | Lighthouse mobile | Performance ≥ 75 (target bertahap ke ≥85) |

Rollback = upload ulang zip versi sebelumnya (`dist-renmoku-vX.Y.zip` disimpan sebagai artefak rilis). Karena stateless, rollback hanya soal file statis — skema DB dibuat backward-compatible (migration additive).

---

## 7. Alur Runtime Request (saat aplikasi hidup — "serverless"-nya di sini)

```
User buka URL ──▶ InfinityFree sajikan index.html+JS (statis, cached)
User login     ──▶ JS ─HTTPS─▶ Supabase Auth (GoTrue) ── session JWT localStorage
List mobil     ──▶ JS ─HTTPS─▶ PostgREST SELECT + RLS filter  (cache SWR di client)
Booking submit ──▶ JS ─RPC─▶ create_booking_with_inventory_check (edge: constraint anti double-book)
Status berubah ◀── WS ────── Supabase Realtime postgres_changes (fallback: polling 15s)
Foto profil    ──▶ JS ──HTTPS─▶ Cloudinary unsigned preset ── return secure_url (CDN selamanya)
KTP/SIM        ──▶ Supabase Storage privat ── admin buka via signed URL 60s (Edge Function)
Bayar          ──▶ Midtrans ─server-to-server─▶ Edge Function payment-webhook ─▶ update booking
```

Tidak ada satu pun proses Node/PHP long-running milik kita — seluruh compute ditanggung platform sesuai request. ✔️ Serverless tercapai.

---

## 8. Monitoring Kuota & Trigger Upgrade (rutin mingguan)

| Layanan | Cek di | Ambang peringatan | Aksi saat terlampaui |
|---------|--------|-------------------|----------------------|
| InfinityFree | Client Area > Stats | Bandwidth harian > 4 GB | Perketat cache/ukuran asset; pertimbangkan pindah Cloudflare Pages |
| Supabase | Dashboard > Usage | Egress > 3.5 GB/bln; project mau auto-pause | Upgrade Pro ($25/bln) ATAU akses dashboard tiap 6 hari |
| Cloudinary | Console > Usage | Credit < 5 tersisa | Naikkan kualitas→harga rasio (`q_70`), batasi ukuran video, atau ImageKit |
| Auto-pause Supabase | — | Project paused | Klik **Restore** di dashboard (data aman 14 hari) |

---

## 9. Troubleshooting Cepat

| Gejala | Penyebab umum | Fix |
|--------|--------------|-----|
| 404 saat refresh halaman dalam | `.htaccess` tidak ikut terekstrak | Re-extract zip; nyalakan show hidden files |
| Blank page putih | Base path salah / asset 404 | Pastikan ekstrak di akar `htdocs/`, cek console network |
| Login "Invalid redirect URL" | Domain belum didaftarkan di Supabase Auth | Fase A5 — tambahkan URL persis termasuk `https://` |
| CORS error ke Supabase | Mengakses dari domain lain/staging | Tambahkan origin di Supabase (atau sudah dicakup anon key policy) |
| Upload gambar 400/401 | Preset salah nama / mode Signed | Cek `VITE_CLOUDINARY_UPLOAD_PRESET` & Signing Mode Unsigned |
| Realtime tidak update | Free-tier limit / tab idle | Aktifkan kembali koneksi (code sudah handle) — fallback polling tetap jalan |
| Website suspend mendadak | Pelanggaran fair use InfinityFree | Kurangi payload, pasang CDN (Cloudflare) di depan domain |

---

## 10. Ringkasan Timeline First-Time Deployment

```
Hari 0 (±60 menit):  A Supabase provisioning ─ B Cloudinary ─ C InfinityFree + SSL
                     D ./scripts/deploy.sh ─ upload zip ─ E smoke test 8 poin
Setiap rilis (±5 mnt): pull main → ./scripts/deploy.sh [--upload] → smoke test 1–6
Mingguan              : monitoring kuota (§8)
```

**Definisi "Production Ready" jalur serverless ini:** §6 semua hijau + §1 tidak ada secret bocor + backup export DB bulanan (Supabase Dashboard → Database → Backup) aktif.
