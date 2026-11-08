# 🏗️ Design Concept — Kelayakan Produksi Serverless
## Renmoku · Stack: InfinityFree + Supabase + Cloudinary

> **Dokumen:** Production Readiness & Feasibility Design Concept
> **Versi:** 1.0 · **Tanggal:** 2026-11-08
> **Audiens:** Tech Lead, Developer, UI/UX Designer, Owner Bisnis
> **Status dokumen induk arsitektur** — menggantikan asumsi AWS S3/EC2 pada `FILE-STORAGE-ARCHITECTURE.md` untuk jalur deployment *free-tier serverless*.

---

## 1. Ringkasan Eksekutif (Executive Summary)

Renmoku adalah platform rental mobil multi-role (Renter / Owner / Admin). Target deployment kali ini adalah **serverless murni dengan biaya Rp0/bulan** menggunakan:

| Layer | Layanan | Peran | Batas Free-Tier Kunci |
|---|---|---|---|
| **Hosting Frontend** | InfinityFree | Static SPA (hasil `vite build`) | 1 GB disk, ~5 GB bandwidth/bln, **tanpa Node.js**, tanpa cron andal, SSL gratis |
| **Data & Auth** | Supabase | PostgreSQL, Auth, RLS, Realtime, Edge Functions, Storage | DB 500 MB, **bandwidth egress 5 GB/bln**, 50K MAU, Realtime 200 concurrent |
| **Media** | Cloudinary | Optimasi & CDN gambar/video kendaraan & KYC | **~25 credit/bulan** (≈25 GB storage + 25 GB transfer) |

### Verdict Kelayakan

```
┌────────────────────────────────────────────────────────────────────┐
│  FAIR USAGE (MVP awal)      : ✅ LAYAK (feasible)                  │
│  SKALA PRODUKSI >500 DAU    : ⚠️  TIDAK LAYAK tanpa upgrade        │
│  DATA SENSITIF (KYC/NIK)    : ⚠️  SYARAT: enkripsi + bucket privat │
│  REALTIME GPS TRACKING      : ❌ BUTUH fallback polling di free    │
│                                 tier (socket.io backend tidak bisa │
│                                 jalan di InfinityFree)             │
└────────────────────────────────────────────────────────────────────┘
```

**Rekomendasi inti:** Arsitektur saat ini sudah ~80% siap (lihat §7 Gap Analysis). Tiga pekerjaan besar yang menentukan kelayakan produksi:
1. **Menghapus ketergantungan pada backend Express/socket.io** → pindah ke Supabase Realtime (`postgres_changes`) + Edge Functions.
2. **Menegakkan media pipeline Cloudinary** (unsigned preset → signed policy bertahap) dengan quota guard (§5.3).
3. **Hardening keamanan client-side** karena SPA statis mengekspos anon key (§6).

---

## 2. Prinsip Desain (Design Principles)

1. **Serverless-first, bukan lift-and-shift.** InfinityFree hanya melayani file statis. Semua logika berjalan di Supabase (DB, Auth, RLS, Edge Functions) dan Cloudinary (media pipeline). Tidak ada proses Node.js yang perlu "dijaga tetap hidup".
2. **Gratis sampai terbukti perlu bayar.** Setiap fitur harus punya *quota budget* di atas free tier; ketika menyentuh batas, aplikasi **degrade gracefully** (cache, polling, placeholder), bukan crash.
3. **RLS adalah backend kita.** Otorisasi multi-role (renter/owner/admin) ditegakkan di database, bukan di komponen React. Kode frontend dianggap *tidak dipercaya* (zero-trust client).
4. **Bandwidth = mata uang paling mahal.** 5 GB egress Supabase + 25 GB transfer Cloudinary habis dengan cepat oleh gambar. Setiap byte yang dikirim ke user harus lewat optimasi (WebP/AVIF, lazy, CDN).
5. **UI/UX mengikuti kendala teknis.** Skeleton loading, optimistic UI, dan offline-tolerance bukan polish — mereka kompensasi arsitektur (cold start Edge Function, latency shared hosting, quota).

---

## 3. Arsitektur Target (To-Be Architecture)

### 3.1 Diagram Konteks

```
                        ┌──────────────────────────────┐
                        │        USER (Browser)        │
                        │   PWA-ready SPA, ID-market   │
                        └───────┬──────────────┬───────┘
                    HTTPS static│              │HTTPS JSON/upload
                                ▼              ▼
        ┌───────────────────────────┐   ┌───────────────────────────────┐
        │  INFINITYFREE (hanya STA- │   │        SUPABASE               │
        │  TIS: index.html + assets)│   │ ┌─────────┐ ┌──────────────┐  │
        │  • vite build output      │   │ │  Auth   │ │ PostgREST    │  │
        │  • .htaccess (SPA rewrite,│   │ │ (JWT,   │ │ (CRUD via    │  │
        │    cache headers, gzip)   │   │ │  RLS)   │ │  @supabase/  │  │
        │  • NO server code         │   │ └────┬────┘ │  js)         │  │
        └───────────────────────────┘   │      │      └──────┬───────┘  │
                                        │      ▼             ▼          │
        ┌───────────────────────────┐   │ ┌─────────────────────────┐   │
        │  CLOUDINARY               │◄──┤ │ Edge Functions (Deno):  │   │
        │  • unsigned preset upload│    │ │ • booking-confirm       │   │
        │  • f_webp,q_auto,w_resp │     │ │ • payment-webhook       │   │
        │  • CDN global (fastly)   │    │ │ • kyc-moderation-hook   │   │
        │  • damage_control limit  │    │ │ • rate-limiter (upstash)│   │
        └───────────▲───────────────┘   │ ├─────────────────────────┤   │
                    │ transform URL     │ │ Realtime: postgres_changes│ │
                    │ (saja, tanpa API  │ │ Storage: contracts (priv) │ │
                    │  key di client)   │ └─────────────────────────┘   │
                    └───────────────────┘                               │
                                                                        │
             Webhook pembayaran (Midtrans/Xendit) ──► Edge Function ──►─┘
```

### 3.2 Pembagian Tanggung Jawab (Responsibility Matrix)

| Concern | Sekarang (As-Is) | Target (To-Be) | Alasan |
|---|---|---|---|
| Serving HTML/JS/CSS | Vite dev / rencana InfinityFree | ✅ InfinityFree (`/htdocs`) | Satu-satunya yang cocok |
| CRUD data | `backend/` Express + Prisma | ✅ **Supabase JS client langsung** (`src/services/supabaseService.ts`) | Express tak bisa host di InfinityFree |
| Auth & sesi | `src/lib/auth.tsx` (mock + supabase helpers) | ✅ Supabase Auth + RLS | JWT otomatis, zero maintenance |
| Upload gambar kendaraan | rencana pre-signed S3 | ✅ **Cloudinary unsigned preset** (`src/lib/cloudinary.ts` sudah mendukung) | Tanpa secret di server |
| Dokumen KYC | rencana private S3 bucket | ✅ **Supabase Storage private bucket** + signed URL 60 dtk | Data pribadi tidak boleh ke CDN publik |
| Notifikasi realtime | socket.io server (`backend/`) | ✅ **Supabase Realtime `postgres_changes`** | Socket.io butuh always-on server → mustahil di stack ini |
| GPS tracking live | `gpsTrackingService.ts` + socket | ✅ Polling 30–60 dtk + cache; **upgrade path**: Realtime channel berbayar | Hemat koneksi & egress |
| Transaksi bisnis (booking hold) | belum ada | ✅ Edge Function atomic (RPC) | Mencegah double-booking race condition |
| Email transaksi | belum ada | ✅ Supabase Auth emails + Edge Function SMTP (Resend free 3K/bln) | InfinityFree tidak bisa kirim email andal |

### 3.3 Kontrak Data Penting

- **State machine booking** (wajib ditegakkan via RLS policy + trigger, bukan UI):
  `pending → confirmed → active → completed`, cabang: `cancelled`, `expired` (auto-release kunci kendaraan setelah 2 jam via `pg_cron` di Supabase free — tersedia sebagai scheduled job internal).
- **Inventory lock:** `available_from` / `available_to` per vehicle dengan constraint `EXCLUDE USING gist (vehicle_id WITH =, period WITH &&)` → double-booking ditolak di level DB.
- **Soft-delete & audit:** setiap tabel utama punya `created_at, updated_at, deleted_at, created_by`; trigger `updated_at` di SQL.

---

## 4. Alur Pengguna Utama (Critical User Journeys)

### 4.1 Journey: Penyewa mencari & memesan mobil (Happy Path)

```
Cari (filter) ─► Detail (360° view) ─► Pilih tanggal ─► Hitung harga
     │                │                     │                 │
  PostgREST       Cloudinary CDN        Calendar RPC      Pure client
  (indexed,       (webp, lazy)         (availability)   (pricing rules)
  <200ms)
                     ─► Login (Supabase Auth) ─► Upload SIM/KTP (Cloudinary/SB Storage)
                     ─► Bayar (redirect Midtrans sandbox→prod) ─► Webhook ─► Edge Fn
                     ─► Status "Dikonfirmasi" (Realtime push) ─► Notifikasi in-app
```

**Aturan UX untuk journey ini (lihat §8):**
- Hasil pencarian **harus tampil ≤ 2 detik** di jaringan 3G Indonesia → paginasi cursor 12 item, query select eksplisit kolom (bukan `select *`).
- Booking button memakai **optimistic lock**: RPC `create_booking()` mengembalikan error `period_overlap` → tampilkan dialog "Mobil baru saja dipesan, lihat alternatif serupa" (menjaga trust, bukan sekadar toast merah).

### 4.2 Journey: Owner menambah armada
Form multi-step (Identitas → Spesifikasi → Foto 4 sisi → Harga). Foto di-*compress* client-side (Canvas → max 1600px, q75) **sebelum** upload Cloudinary — melindungi kuota 25 GB. Progress bar per-file + retry individual.

### 4.3 Journey: Admin verifikasi KYC
Daftar antrean antrian verifikasi → buka dokumen via **signed URL Supabase Storage (expire 60 dtk, sekali pakai)** → approve/reject dengan alasan (template) → status memicu Realtime update ke dashboard renter.

---

## 5. Analisis Kelayakan Teknis per Layanan

### 5.1 InfinityFree — Host Statis SPA

**Kecocokan: ⚠️ Layak dengan syarat ketat.**

Masalah khas InfinityFree dan mitigasinya:

| Risiko | Dampak | Mitigasi Desain |
|---|---|---|
| Tidak ada Node.js runtime | Backend Express mati total | Seluruh API pindah ke Supabase (PostgREST + Edge Functions). Direktori `backend/` dipertahankan **hanya untuk lokal/dev** |
| Routing SPA → 404 saat refresh | UX rusak di `/dashboard/owner` | `.htaccess`: rewrite semua non-file ke `index.html` |
| Shared hosting lambat & blokir hotlink sesekali | TTFB tinggi | Asset fingerprinted + cache 1 tahun; HTML `no-cache`; preload font |
| Bandwidth bulanan terbatas + fair-use policy | Suspensi akun | Bundle < 300 KB gz (code-splitting route), gambar **tidak pernah** dilayani dari sini (semua Cloudinary) |
| Subdomain `.infinityfreeapp.com` kurang kredibel | Conversion turun | Segera pasang domain kustom + Let's Encrypt (didukung); siapkan migration plan ke Cloudflare Pages/Netlify sebagai upgrade path resmi |

`.htaccess` standar yang direkomendasikan (disimpan di repo sebagai `public/.htaccess` agar ikut ter-build):

```apache
# --- SPA fallback ---
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# --- Cache & kompresi ---
<IfModule mod_headers.c>
  <FilesMatch "\.(js|css|woff2|png|webp|svg)$">
    Header set Cache-Control "max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "index\.html$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
</IfModule>
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html application/javascript text/css application/json
</IfModule>
```

### 5.2 Supabase — DB, Auth, Realtime, Edge Functions

**Kecocokan: ✅ Sangat layak sebagai core backend.** Sudah ada fondasinya: `supabase/schema.sql`, `src/lib/supabase.ts`, `src/services/supabaseService.ts`.

Titik keputusan desain:

1. **RLS sebagai lapisan otorisasi tunggal.** Contoh kebijakan (ringkas):
   ```sql
   -- Kendaraan: publik boleh lihat listing aktif; owner hanya ubah miliknya
   create policy "vehicles_public_read" on vehicles
     for select using (status = 'active' or owner_id = auth.uid()
                       or exists (select 1 from profiles p
                                  where p.id = auth.uid() and p.role = 'admin'));

   create policy "vehicles_owner_write" on vehicles
     for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
   ```
   Role disimpan di tabel `profiles.role` (`renter|owner|admin`) — jangan di JWT custom claims agar mudah diubah admin tanpa re-login.
2. **Egress 5 GB/bulan adalah batas keras.** Estimasi kasar: 500 session × 10 query × 30 KB ≈ 150 MB/bulan → aman. Yang membunuh kuota adalah payload gambar base64 dari DB — **larang keras menyimpan media sebagai blob di Postgres**; simpan hanya URL.
3. **Realtime:** ganti socket.io dengan kanal `postgres_changes` pada `bookings`, `verification_requests`, `notifications`. Free tier 200 concurrent connection cukup untuk MVP (<200 pengguna aktif bersamaan).
4. **Edge Functions (Deno) untuk:** webhook pembayaran (verifikasi signature Midtrans), RPC transaksional booking, dan pemanggilan Admin API Cloudinary (destroy/restore asset) — satu-satunya tempat `CLOUDINARY_API_SECRET` boleh berada.
5. **Kolom computed/index wajib** untuk query katalog: GIN index pada filter, btree pada `(status, price_per_day)`, dan materialized view ringan untuk dashboard analitik (di-refresh via Edge Function terjadwal, bukan cron InfinityFree).

### 5.3 Cloudinary — Media Pipeline

**Kecocokan: ✅ Layak, dengan governance kuota.** Implementasi `src/lib/cloudinary.ts` (unsigned preset) sudah sesuai pola "tanpa backend".

**Kontrak transformasi (standar produksi):**

| Use case | Transform | Catatan |
|---|---|---|
| Thumbnail kartu listing | `f_webp,q_auto:good,w_400,c_limit` | Default di semua `<VehicleCard>` |
| Halaman detail | `f_auto,q_auto,w_1200,c_limit` | `w_1200` membatasi biaya transfer |
| Virtual 360° (8–12 frame) | `f_webp,q_70,w_900` + preload bertahap | Frame berikutnya dimuat saat idle — **jangan** muat 12×4 MB sekaligus |
| Avatar | `f_avif,q_auto,w_128,h_128,c_fill,g_face` | Face crop |
| KTP/SIM (bila terpaksa public) | ❌ Jangan. Gunakan Supabase Storage privat | Lihat §6.3 |

**Guard rails kuota (wajib diimplementasikan):**
- `upload_preset` dibatasi di dashboard Cloudinary: max size 4 MB, format whitelist `jpg/png/webp`, folder per-entity `renmoku/vehicles/{id}`.
- Compression client-side sebelum upload (target < 500 KB/file).
- Rate-limit upload per user via Edge Function counter di Postgres (`uploads_today < 20`).
- **Signed upload (dengan api_key + sha1 signature) dihitung di Edge Function** begitu fitur mencapai skala — preset unsigned hanya untuk fase uji; dokumentasikan migrasinya.
- Fallback visual saat asset 404/dihapus: `<img onError>` → ilustrasi placeholder branded (lihat §8.4).

---

## 6. Keamanan & Kepatuhan (Security Hardening)

Karena seluruh aplikasi berjalan di browser dengan anon key:

1. **Anon key memang publik** — keamanannya bergantung pada RLS. Audit wajib: *tidak ada tabel tanpa policy* (default deny). Tambahkan test suite `supabase/tests/rls.test.sql` yang menjalankan query sebagai tiap role.
2. **Service role / Cloudinary secret tidak boleh menyentuh bundle frontend.** Cek CI: `grep -rE "service_role|api_secret" dist/` harus kosong. Variabel frontend hanya `VITE_*` yang secara desain publik.
3. **Data KYC (NIK, foto KTP):**
   - Bucket Supabase Storage **private**, akses hanya signed URL dari Edge Function dengan cek role admin.
   - Enkripsi kolom `nik` di DB (`pgcrypto`, key di Vault/edge config), tampil hanya 4 digit terakhir di UI (`••••••••1234`).
   - Retensi: hapus dokumen gagal-verifikasi > 90 hari (Edge Function terjadwal). Selaras UU PDP Indonesia.
4. **Rate limiting:** Edge Function proxy untuk endpoint sensitif (login attempt, create booking) dengan Upstash Ratelimit free tier; plus `auth_rate_limit` trigger di Supabase.
5. **Header keamanan** via `.htaccess`: `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin`, CSP membolehkan `res.cloudinary.com`, `*.supabase.co`, gateway pembayaran.
6. **Webhook pembayaran:** selalu verifikasi tanda tangan + idempotency key (unique constraint pada `payment_ref`) agar replay tidak membuat dua booking.

---

## 7. Gap Analysis (As-Is Repo → To-Be Production)

Berdasarkan inspeksi kode saat ini:

| # | Temuan di repo | Status | Aksi menuju produksi |
|---|---|---|---|
| G1 | `backend/` Express + socket.io + Prisma | 🔴 Tidak bisa di-deploy di InfinityFree | Freeze sebagai legacy/dev-only; port endpoint ke Edge Functions; hapus dependensi socket.io-client dari bundel |
| G2 | `src/lib/supabase.ts` memakai placeholder fallback `'https://your-project.supabase.co'` | 🟡 | Fail-fast saat build produksi bila env kosong (throw di `vite build --mode production`), bukan fallback diam-diam |
| G3 | `docs/FILE-STORAGE-ARCHITECTURE.md` masih berbasis AWS S3 presigned | 🟡 Konflik dokumentasi | Dokumen ini menjadi sumber kebenaran jalur serverless; tandai doc lama sebagai *future/scale-up path* |
| G4 | `src/api/mock.ts` dipakai beberapa halaman | 🟡 | Feature flag `VITE_USE_MOCKS=false` di produksi; CI menolak merge bila mock tertinggal di halaman critical path |
| G5 | 360° viewer memuat banyak frame resolusi penuh | 🔴 Ancaman kuota Cloudinary | Terapkan ladder kualitas §5.3 + progressive preload |
| G6 | Belum ada `.htaccess` SPA rewrite | 🔴 Refresh → 404 | Tambahkan ke `public/` (snippet §5.1) |
| G7 | RLS policies di `supabase/schema.sql` perlu audit menyeluruh | 🟡 | Checklist §6.1 + test RLS otomatis |
| G8 | GPS realtime mengandalkan socket | 🔴 | Ubah ke polling + cache (desain §3.2), dokumentasikan SLAM degradasi |

---

## 8. Konsep UI/UX untuk Produksi (Production UX Spec)

Prinsip: **kinerja adalah fitur, kegagalan adalah desain.**

### 8.1 Sistem Visual (mengacu `docs/COLOR-PALETTE.md`)
- Pertahankan identitas premium (dark navy + gold accent) namun **turunkan saturasi shadow/glassmorphism pada low-end device** via `@media (prefers-reduced-motion)` dan flag `low-power` (deteksi `deviceMemory <= 2`).
- Token spacing/typography diekspor sebagai CSS variables Tailwind v4 (`@theme`) — konsistensi lintas 40+ halaman.

### 8.2 Kecepatan & Persepsi Latensi
| Teknik | Sasaran Angka |
|---|---|
| Route-based code splitting (`React.lazy` per halaman) | Initial JS < 300 KB gz |
| `loading="lazy"` + `sizes` pada semua gambar listing | LCP < 2.5 s (3G Fast) |
| Skeleton screens untuk kartu & tabel dashboard (bukan spinner) | Zero layout shift (CLS < 0.1) |
| Prefetch rute berikutnya saat hover/viewport | Navigasi terasa < 100 ms |
| Optimistic UI untuk favorit, draft booking | Feedback instan |
| Cold-start Edge Function (~300–800 ms) → tombol disable + micro-progress | Hindari double-submit |

### 8.3 Pola Penanganan Kuota & Kegagalan (khas stack ini)
- **Error taxonomy** dengan copy bahasa Indonesia yang menenangkan:
  - `RATE_LIMIT` → "Terlalu banyak percobaan. Coba lagi 60 detik." (countdown nyata)
  - `QUOTA_MEDIA` (upload Cloudinary ditolak) → "Kuota unggah harian tercapai, foto tersimpan sebagai draf." + autosave draft ke localStorage → sinkron otomatis besok.
  - `REALTIME_DISCONNECTED` → badge "Mode hemat — status diperbarui tiap 60 detik" (bukan error merah).
- **Offline banner** global (sonner toast) + antrian aksi (mutasi kecil ditulis ulang saat online).
- **Image fallback chain:** WebP → JPEG → placeholder SVG branded.

### 8.4 Aksesibilitas & Lokalita
- WCAG AA: kontras teks di atas foto kendaraan memakai scrim gelap (token `--scrim: rgba(10,14,26,.55)`); semua ikon lucide punya `aria-label`; fokus ring terlihat pada dark bg.
- i18n (id/en) sudah ada — pastikan string error teknis baru masuk kedua locale sebelum rilis.
- Mobile-first: bottom-nav (sudah didokumentasikan) menjadi navigasi utama; form booking memakai input numeric/kalendar native.

---

## 9. Runbook Deployment (Step-by-Step)

Ringkas; detail panjang ada di `docs/DEPLOYMENT-INFINITYFREE.md`.

```bash
# 1. Build dengan env produksi
cp .env.example .env.production   # isi VITE_SUPABASE_URL, ANON_KEY, CLOUD_NAME, PRESET
npm run build                      # menghasilkan dist/

# 2. Verifikasi hasil build (CI gate)
du -sh dist/assets/*.js | sort -h           # bundle size guard
grep -rE "service_role|api_secret" dist/ && exit 1  # secret leak guard

# 3. Deploy statis ke InfinityFree
#    Upload isi dist/ (termasuk .htaccess) ke /htdocs via FileZilla/FileManager
#    Aktifkan SSL (AutoSSL) lalu paksa HTTPS di .htaccess

# 4. Supabase
#    - Jalankan supabase/schema.sql di SQL Editor
#    - Buat bucket: renmoku-contracts (private)
#    - Deploy edge functions: supabase functions deploy booking-confirm payment-webhook
#    - Set Site URL + Redirect URL ke domain infinityfree

# 5. Cloudinary
#    - Buat upload preset "renmoku_preset" (unsigned, folder locking, size cap 4MB)
#    - Aktifkan "Generate sprite/WEBP on the fly", batasi bandwidth alert di 20 GB

# 6. Smoke test produksi (wajib, lihat §10 checklist)
```

**Upgrade path resmi** (ketika menyentuh batas): InfinityFree → Cloudflare Pages (gratis, lebih cepat, preview deploy); Supabase free → Pro ($25/bln); Cloudinary → Advanced atau ImageKit. Perpindahan tidak mengubah kontrak kode karena semuanya sudah berbasis URL/SDK.

---

## 10. Definisi "Siap Produksi" (Release Checklist)

**Functional**
- [ ] Signup/login/reset-password via Supabase Auth berjalan di domain produksi (bukan localhost)
- [ ] Alur booking lengkap: overlap ditolak DB, webhook pembayaran mengkonfirmasi, notifikasi Realtime diterima
- [ ] Upload 4 foto kendaraan berhasil & tampil dalam WebP ≤ 150 KB/thumbnail
- [ ] KYC hanya dapat dibuka admin (signed URL; coba akses anonim → 400/401)

**Performance (budget)**
- [ ] Lighthouse mobile ≥ 85 (Perf), LCP < 2.5 s, CLS < 0.1, JS init < 300 KB gz
- [ ] Estimasi egress bulan pertama < 1 GB (dashboard Supabase Analytics)

**Security**
- [ ] Semua tabel punya RLS enabled + enforced; hasil audit policy terlampir
- [ ] Tidak ada secret di bundel (CI gate lulus)
- [ ] Headers CSP/HSTS/XFO terkirim (uji securityheaders.com skor ≥ A-)

**Operational**
- [ ] Halaman 404/500 & banner offline kuotas tersedia dalam id/en
- [ ] Backup DB mingguan (Supabase PITR manual export via Edge Function) diuji restore
- [ ] Runbook rollback: cara freeze upload & matikan fitur realtime saat kuota kritis

---

## 11. Roadmap Bertahap

| Fase | Durasi | Fokus | Keluaran |
|---|---|---|---|
| **0. Stabilisasi** | 1 minggu | G1, G2, G6, G8 | SPA hidup di InfinityFree tanpa 404; fail-fast env |
| **1. Serverless Core** | 2 minggu | RLS audit (G7), Edge booking + webhook, Realtime menggantikan socket | Alur end-to-end tanpa backend Express |
| **2. Media Governance** | 1 minggu | Ladder transform, compress client, quota guard (G5) | Biaya media predictable < 8 GB/bln |
| **3. UX Produksi** | 2 minggu | Skeleton/error taxonomy/a11y §8 | Lighthouse ≥ 85, rilis soft-launch |
| **4. Skala** | saat traction | Upgrade tier, domain kustom, monitoring Sentry/UptimeRobot | App siap > 500 DAU |

---

*Dokumen ini adalah design concept pengikat untuk jalur serverless. Perubahan kontrak data/keamanan harus melalui review dan memperbarui §3.3 & §6.*
