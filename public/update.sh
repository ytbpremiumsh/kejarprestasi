#!/usr/bin/env bash
# =============================================================
#  Kejar Prestasi - Auto Update Script
# =============================================================
#  Penggunaan:
#    bash <(curl -fsSL https://<DOMAIN>/update.sh)
#  atau setelah pertama kali install:
#    cd /var/www/kejar-prestasi && ./update.sh
# =============================================================

set -e

APP_DIR="${APP_DIR:-$(pwd)}"
BRANCH="${BRANCH:-main}"
PM2_NAME="${PM2_NAME:-kejar-prestasi}"
NODE_MIN=20

color() { printf "\033[%sm%s\033[0m\n" "$1" "$2"; }
info()  { color "1;34" "==> $1"; }
ok()    { color "1;32" "✔  $1"; }
warn()  { color "1;33" "!  $1"; }
err()   { color "1;31" "✖  $1"; }

trap 'err "Update gagal pada langkah terakhir. Periksa pesan di atas."' ERR

info "Direktori aplikasi: $APP_DIR"
cd "$APP_DIR"

# 1. Cek prasyarat
command -v git  >/dev/null || { err "git tidak ditemukan"; exit 1; }
command -v node >/dev/null || { err "Node.js tidak ditemukan (butuh v${NODE_MIN}+)"; exit 1; }

NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VER" -lt "$NODE_MIN" ]; then
  err "Versi Node terlalu lama (v$NODE_VER). Butuh v${NODE_MIN}+."
  exit 1
fi

# 2. Backup .env
if [ -f .env ]; then
  cp .env ".env.backup.$(date +%Y%m%d-%H%M%S)"
  ok ".env dibackup"
fi

# 3. Tarik perubahan terbaru
info "Mengambil pembaruan dari Git ($BRANCH)..."
git fetch --all --prune
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "origin/$BRANCH")

if [ "$LOCAL" = "$REMOTE" ]; then
  ok "Sudah versi terbaru. Tidak ada update."
  exit 0
fi

git reset --hard "origin/$BRANCH"
ok "Source code diperbarui ke $(git rev-parse --short HEAD)"

# 4. Install dependensi
info "Menginstall dependensi..."
if command -v bun >/dev/null; then
  bun install
elif command -v pnpm >/dev/null; then
  pnpm install --frozen-lockfile
else
  npm install --no-audit --no-fund
fi
ok "Dependensi terpasang"

# 5. Build production
info "Membuild aplikasi..."
if command -v bun >/dev/null; then
  bun run build
else
  npm run build
fi
ok "Build selesai"

# 6. Restart service
if command -v pm2 >/dev/null; then
  if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
    pm2 restart "$PM2_NAME" --update-env
  else
    pm2 start "npm run start" --name "$PM2_NAME"
  fi
  pm2 save
  ok "PM2 restart: $PM2_NAME"
elif command -v systemctl >/dev/null && systemctl list-unit-files | grep -q "kejar-prestasi"; then
  sudo systemctl restart kejar-prestasi
  ok "systemd restart: kejar-prestasi"
else
  warn "PM2/systemd tidak terdeteksi. Restart proses Node manual."
fi

ok "Update selesai 🎉"
