#!/usr/bin/env bash
# ============================================================================
# RENMOKU - One-command deploy ke InfinityFree (serverless: Supabase+Cloudinary)
#
# Alur:  typecheck -> build -> verifikasi .htaccess ter-bundle -> zip siap-upload
#        (opsional) upload langsung via lftp ke htdocs InfinityFree
#
# Pakai:
#   ./scripts/deploy.sh                 # build + buat dist-renmoku.zip
#   FTP_USER=u123456789 FTP_PASS=xxx FTP_HOST=ftpupload.net \
#     ./scripts/deploy.sh --upload      # + upload otomatis via FTP
#
# Catatan: kredensial FTP hanya lewat environment variable, JANGAN hardcode.
# ============================================================================
set -euo pipefail
cd "$(dirname "$0")/.."

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'
step() { echo -e "${GREEN}==>${NC} $1"; }
warn() { echo -e "${YELLOW}!!${NC} $1"; }
die()  { echo -e "${RED}xx${NC} $1" >&2; exit 1; }

# --- 0. Guard: env produksi harus sudah diisi --------------------------------
[ -f .env ] || die ".env tidak ditemukan. Salin dari .env.example lalu isi kredensial Supabase & Cloudinary."
grep -q "your-project-id" .env && die "VITE_SUPABASE_URL masih placeholder — isi project URL Supabase dulu."
grep -q "your-cloud-name" .env && warn "VITE_CLOUDINARY_CLOUD_NAME masih placeholder — upload gambar akan fallback ke mock."

# --- 1. Quality gate ------------------------------------------------------------
step "Typecheck (tsc --noEmit)"
npm run typecheck

# --- 2. Build -------------------------------------------------------------------
step "Build produksi (vite build)"
npm run build

# --- 3. Post-build checks ---------------------------------------------------------
step "Verifikasi artefak"
[ -f dist/index.html ] || die "dist/index.html tidak ada — build gagal?"

# Vite menyalin public/* ke dist/, tetapi dotfile (.htaccess) kadang tidak ikut
# di beberapa setup -> salin manual sebagai jaminan.
if [ ! -f dist/.htaccess ]; then
  warn ".htaccess tidak otomatis ter-bundle — menyalin manual dari public/"
  cp public/.htaccess dist/.htaccess
fi

# Anti-secret-leak gate (blocking): service_role key tidak boleh masuk bundle
if grep -Rq "service_role" dist/assets/ 2>/dev/null; then
  die "DITEMUKAN indikasi service_role key di bundle! Batalkan deploy, cek .env (hanya VITE_* yang boleh)."
fi

BYTES=$(du -sb dist | cut -f1)
MB=$(( BYTES / 1024 / 1024 ))
[ "$MB" -gt 8 ] && warn "Ukuran dist ${MB} MB — mendekati batas fair-use bandwidth InfinityFree per hari."
step "Bundle OK (${MB} MB termasuk asset)"

# --- 4. Packing -------------------------------------------------------------------
step "Mengemas dist-renmoku.zip (isi = KONTEN dist/, bukan folder dist itu sendiri)"
rm -f dist-renmoku.zip
(cd dist && zip -qr ../dist-renmoku.zip .)
step "Selesai: dist-renmoku.zip siap diupload ke htdocs/ InfinityFree"

# --- 5. Opsi: upload FTP otomatis --------------------------------------------------
if [ "${1:-}" = "--upload" ]; then
  command -v lftp >/dev/null || die "lftp tidak ditemukan. Install (brew/apt install lftp) atau upload manual via File Manager."
  : "${FTP_USER:?Set FTP_USER (login FTP InfinityFree, mis. if0_12345678)}"
  : "${FTP_PASS:?Set FTP_PASS}"
  : "${FTP_HOST:?Set FTP_HOST (lihat Control Panel > FTP Accounts, umumnya ftpupload.net)}"
  step "Sinkronkan dist/ -> htdocs/ via FTP ($FTP_HOST sebagai $FTP_USER)"
  lftp -u "$FTP_USER,$FTP_PASS" "$FTP_HOST" <<LFTP
set ssl:verify-certificate no
set xfer:clobber on
mirror --reverse --delete --verbose ./dist/ htdocs/
bye
LFTP
  step "Deploy selesai. Verifikasi https://<domain-kamu>/ dan jalankan smoke test (docs bagian 6)."
else
  echo -e "${YELLOW}Langkah lanjut (manual):${NC}"
  echo "  1) InfinityFree Control Panel > Online File Manager (atau FileZilla)"
  echo "  2) Upload & ekstrak dist-renmoku.zip LANGSUNG ke /htdocs/"
  echo "  3) Pastikan .htaccess ikut terekstrak (aktifkan 'show hidden files')"
  echo "  4) Smoke test sesuai docs/DEPLOY-FLOW-SERVERLESS.md bagian 6"
fi
