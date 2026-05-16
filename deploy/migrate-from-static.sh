#!/usr/bin/env bash
# Perbaiki deployment aaPanel lama/salah → Node SSR PM2 + webroot static fallback.
# Aman dijalankan berkali-kali (idempotent).
set -e

APP_DIR="${APP_DIR:-/var/www/kejarprestasi}"
WEBROOT="${WEBROOT:-/www/wwwroot/kejarprestasi.id}"
PM2_NAME="${PM2_NAME:-kejarprestasi}"
DOMAIN="${DOMAIN:-kejarprestasi.id}"

color() { printf "\033[%sm%s\033[0m\n" "$1" "$2"; }
info() { color "1;34" "==> $1"; }
ok()   { color "1;32" "✔  $1"; }
warn() { color "1;33" "!  $1"; }

# 1. Stage webroot normal: assets/, index.html, favicon.ico — bukan client/ server/
bash "$APP_DIR/deploy/stage-webroot.sh"

# 2. Pastikan Nginx config baru terpasang
NEW_CONF="/etc/nginx/conf.d/${DOMAIN}.conf"
if [ ! -f "$NEW_CONF" ]; then
  cp "$APP_DIR/deploy/nginx-kejarprestasi.id.conf" "$NEW_CONF"
  ok "Nginx config dipasang: $NEW_CONF"
fi

# 3. Disable aaPanel vhost lama (jika ada)
for f in /www/server/panel/vhost/nginx/kejarprestasi.id.conf /etc/nginx/sites-enabled/kejarprestasi.id; do
  if [ -f "$f" ]; then
    mv "$f" "${f}.disabled.$(date +%s)"
    warn "Vhost lama dinonaktifkan: $f"
  fi
done

nginx -t && systemctl reload nginx
ok "Nginx reload OK"

# 4. PM2
cd "$APP_DIR"
if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  pm2 reload "$PM2_NAME" --update-env
else
  pm2 start ecosystem.config.cjs
fi
pm2 save
ok "PM2 jalan: $PM2_NAME"

# 5. Smoke test
sleep 2
curl -I -s http://127.0.0.1:3000 | head -1 || true
curl -I -s "http://${DOMAIN}" | head -1 || true
ok "Migrasi selesai"
