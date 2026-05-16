#!/usr/bin/env bash
# =============================================================
#  Kejar Prestasi — Install Script VPS (Node SSR + PM2 + Nginx)
#  Tidak menyalin apapun ke /www/wwwroot — semua hidup di APP_DIR.
# =============================================================
set -e

APP_DIR="${APP_DIR:-/var/www/kejarprestasi}"
REPO_URL="${REPO_URL:-}"
BRANCH="${BRANCH:-main}"
PM2_NAME="${PM2_NAME:-kejarprestasi}"
WEBROOT="${WEBROOT:-/www/wwwroot/kejarprestasi.id}"
NODE_MIN=20
DOMAIN="${DOMAIN:-kejarprestasi.id}"

color() { printf "\033[%sm%s\033[0m\n" "$1" "$2"; }
info()  { color "1;34" "==> $1"; }
ok()    { color "1;32" "✔  $1"; }
warn()  { color "1;33" "!  $1"; }
err()   { color "1;31" "✖  $1"; }

# 1. Node ≥ 20
if ! command -v node >/dev/null || [ "$(node -v | sed 's/v//' | cut -d. -f1)" -lt "$NODE_MIN" ]; then
  info "Install Node.js ${NODE_MIN} via NodeSource..."
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MIN}.x" | bash -
  apt-get install -y nodejs
fi
ok "Node $(node -v)"

# 2. PM2
command -v pm2 >/dev/null || npm install -g pm2
ok "PM2 $(pm2 -v)"

# 3. Clone / pull
mkdir -p "$(dirname "$APP_DIR")"
if [ ! -d "$APP_DIR/.git" ]; then
  [ -z "$REPO_URL" ] && { err "REPO_URL belum diset. Jalankan: REPO_URL=git@... $0"; exit 1; }
  info "Clone $REPO_URL → $APP_DIR"
  git clone -b "$BRANCH" "$REPO_URL" "$APP_DIR"
else
  info "Pull update di $APP_DIR"
  cd "$APP_DIR" && git fetch --all && git reset --hard "origin/$BRANCH"
fi
cd "$APP_DIR"
mkdir -p logs

# 4. .env
if [ ! -f .env ]; then
  warn ".env belum ada. Buat manual dulu di $APP_DIR/.env lalu rerun."
  cat <<EOF
Contoh isi .env:
  VITE_SUPABASE_URL=...
  VITE_SUPABASE_PUBLISHABLE_KEY=...
  SUPABASE_SERVICE_ROLE_KEY=...
  LOVABLE_API_KEY=...
EOF
  exit 1
fi

# 5. Install + build
info "npm ci..."
if [ -f package-lock.json ]; then npm ci --no-audit --no-fund
else npm install --no-audit --no-fund
fi

info "Build Node SSR..."
npm run build:node

# 6. Validasi keras
[ -f dist/server/server.node.js ] || { err "dist/server/server.node.js tidak ada — build gagal"; exit 1; }
[ -d dist/client/assets ]         || { err "dist/client/assets tidak ada — build gagal"; exit 1; }
ok "Build artifacts OK"

# 7. Static fallback untuk webroot aaPanel/Nginx
bash "$APP_DIR/deploy/stage-webroot.sh"

# 8. PM2
if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs
else
  pm2 start ecosystem.config.cjs
fi
pm2 save
pm2 startup systemd -u "$(whoami)" --hp "$HOME" || true
ok "PM2 jalan: $PM2_NAME"

# 9. Nginx config contoh
NGINX_CONF="/etc/nginx/conf.d/${DOMAIN}.conf"
if [ ! -f "$NGINX_CONF" ] && [ -d /etc/nginx/conf.d ]; then
  cp "$APP_DIR/deploy/nginx-kejarprestasi.id.conf" "${NGINX_CONF}.example"
  warn "Contoh Nginx config disalin ke ${NGINX_CONF}.example"
  warn "Review, rename ke .conf, lalu: nginx -t && systemctl reload nginx"
fi

# 10. Smoke test
sleep 2
if curl -fsS -o /dev/null -w "%{http_code}" http://127.0.0.1:3000 | grep -qE "^(200|3..)$"; then
  ok "Node SSR merespon di http://127.0.0.1:3000"
else
  warn "Node SSR belum merespon di port 3000. Cek: pm2 logs $PM2_NAME"
fi

ok "Install selesai. App dir: $APP_DIR"
