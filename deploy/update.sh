#!/usr/bin/env bash
# =============================================================
#  Kejar Prestasi — Update Script (Node SSR / VPS)
#  Pull → build:node → validate → pm2 reload (zero-downtime)
# =============================================================
set -e

APP_DIR="${APP_DIR:-/var/www/kejarprestasi}"
BRANCH="${BRANCH:-main}"
PM2_NAME="${PM2_NAME:-kejarprestasi}"
BUILD_CMD="${BUILD_CMD:-build:node}"
NODE_MIN=20
LOG_FILE="${APP_DIR}/logs/update.log"
WEBROOT="${WEBROOT:-/www/wwwroot/kejarprestasi.id}"

color() { printf "\033[%sm%s\033[0m\n" "$1" "$2"; }
info()  { color "1;34" "==> $1"; }
ok()    { color "1;32" "✔  $1"; }
warn()  { color "1;33" "!  $1"; }
err()   { color "1;31" "✖  $1"; }
stamp() { date '+%Y-%m-%d %H:%M:%S'; }

emit_json() {
  local status="$1" commit="$2" duration="$3" message="$4"
  echo "---UPDATE-RESULT---"
  printf '{"status":"%s","commit":"%s","duration_ms":%s,"message":"%s"}\n' \
    "$status" "$commit" "$duration" "$message"
}

START_TS=$(date +%s%3N 2>/dev/null || echo "0")
mkdir -p "$APP_DIR/logs"
cd "$APP_DIR"
echo "[$(stamp)] update started" >> "$LOG_FILE"

LOCAL_BEFORE=$(git rev-parse HEAD 2>/dev/null || echo "")
trap 'err "Update gagal."; END=$(date +%s%3N 2>/dev/null || echo "0"); emit_json "failed" "${LOCAL_BEFORE:0:7}" "$((END-START_TS))" "script error"' ERR

# 1. Prasyarat
command -v git  >/dev/null || { err "git tidak ditemukan"; exit 1; }
command -v node >/dev/null || { err "Node.js tidak ditemukan (butuh v${NODE_MIN}+)"; exit 1; }
NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
[ "$NODE_VER" -ge "$NODE_MIN" ] || { err "Node terlalu lama (v$NODE_VER, butuh ≥$NODE_MIN)"; exit 1; }

# 2. Pastikan webroot ada, tapi JANGAN pernah salin dist/ mentah ke sini.
mkdir -p "$WEBROOT"

# 3. Backup .env
[ -f .env ] && cp .env ".env.backup.$(date +%Y%m%d-%H%M%S)" && ok ".env dibackup"

# 4. Pull
info "Fetch dari $BRANCH..."
git fetch --all --prune
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "origin/$BRANCH")

if [ "$LOCAL" = "$REMOTE" ] && [ -f dist/server/server.node.js ]; then
  ok "Sudah versi terbaru."
  END=$(date +%s%3N 2>/dev/null || echo "0")
  emit_json "success" "${LOCAL:0:7}" "$((END-START_TS))" "already up to date"
  exit 0
fi

git reset --hard "origin/$BRANCH"
NEW_COMMIT=$(git rev-parse --short HEAD)
ok "Source diperbarui → $NEW_COMMIT"

# 5. Install
info "Install dependensi..."
if [ -f package-lock.json ]; then npm ci --no-audit --no-fund
else npm install --no-audit --no-fund
fi

# 6. Build Node SSR + auto-rollback
info "Build production (target: Node / VPS)..."
set +e
npm run "$BUILD_CMD"
BUILD_EXIT=$?
set -e

if [ "$BUILD_EXIT" -ne 0 ] || [ ! -f dist/server/server.node.js ]; then
  err "Build gagal atau dist/server/server.node.js tidak ditemukan — rollback"
  git reset --hard "$LOCAL_BEFORE" || true
  npm install --no-audit --no-fund || true
  npm run "$BUILD_CMD" || true
  END=$(date +%s%3N 2>/dev/null || echo "0")
  emit_json "failed" "${LOCAL_BEFORE:0:7}" "$((END-START_TS))" "build failed, rolled back"
  exit 1
fi
ok "Build OK — dist/server/server.node.js ada"

# 7. Stage static fallback untuk aaPanel/Nginx webroot.
# Hasil normal: assets/, index.html, favicon.ico — bukan client/ dan server/.
bash "$APP_DIR/deploy/stage-webroot.sh"

# 8. PM2 reload (zero-downtime)
if command -v pm2 >/dev/null; then
  if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
    pm2 reload "$PM2_NAME" --update-env
  else
    pm2 start "$APP_DIR/ecosystem.config.cjs"
  fi
  pm2 save
  ok "PM2 reload: $PM2_NAME"
else
  warn "PM2 tidak ditemukan. Install: npm i -g pm2"
fi

END=$(date +%s%3N 2>/dev/null || echo "0")
echo "[$(stamp)] update success $NEW_COMMIT" >> "$LOG_FILE"
ok "Update selesai 🎉"
emit_json "success" "$NEW_COMMIT" "$((END-START_TS))" "ok"
