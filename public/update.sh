#!/usr/bin/env bash
# =============================================================
#  Kejar Prestasi - Auto Update Script
#  Output JSON ringkas di akhir + auto-rollback jika build gagal.
# =============================================================

set -e

APP_DIR="${APP_DIR:-$(pwd)}"
BRANCH="${BRANCH:-main}"
PM2_NAME="${PM2_NAME:-kejar-prestasi}"
NODE_MIN=20
LOG_FILE="${APP_DIR}/update.log"

color() { printf "\033[%sm%s\033[0m\n" "$1" "$2"; }
info()  { color "1;34" "==> $1"; }
ok()    { color "1;32" "✔  $1"; }
warn()  { color "1;33" "!  $1"; }
err()   { color "1;31" "✖  $1"; }
stamp() { date '+%Y-%m-%d %H:%M:%S'; }

emit_json() {
  local status="$1"; local commit="$2"; local duration="$3"; local message="$4"
  echo "---UPDATE-RESULT---"
  printf '{"status":"%s","commit":"%s","duration_ms":%s,"message":"%s"}\n' \
    "$status" "$commit" "$duration" "$message"
}

START_TS=$(date +%s%3N 2>/dev/null || echo "0")
cd "$APP_DIR"
echo "[$(stamp)] update started" >> "$LOG_FILE"

LOCAL_BEFORE=$(git rev-parse HEAD 2>/dev/null || echo "")

trap 'err "Update gagal."; END=$(date +%s%3N 2>/dev/null || echo "0"); emit_json "failed" "${LOCAL_BEFORE:0:7}" "$((END-START_TS))" "script error"' ERR

# 1. Prasyarat
command -v git  >/dev/null || { err "git tidak ditemukan"; exit 1; }
command -v node >/dev/null || { err "Node.js tidak ditemukan (butuh v${NODE_MIN}+)"; exit 1; }
NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
[ "$NODE_VER" -ge "$NODE_MIN" ] || { err "Node terlalu lama (v$NODE_VER)"; exit 1; }

# 2. Backup .env
if [ -f .env ]; then
  cp .env ".env.backup.$(date +%Y%m%d-%H%M%S)"
  ok ".env dibackup"
fi

# 3. Pull
info "Fetch dari $BRANCH..."
git fetch --all --prune
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "origin/$BRANCH")

if [ "$LOCAL" = "$REMOTE" ]; then
  ok "Sudah versi terbaru."
  END=$(date +%s%3N 2>/dev/null || echo "0")
  emit_json "success" "${LOCAL:0:7}" "$((END-START_TS))" "already up to date"
  exit 0
fi

git reset --hard "origin/$BRANCH"
NEW_COMMIT=$(git rev-parse --short HEAD)
ok "Source diperbarui → $NEW_COMMIT"

# 4. Install
info "Install dependensi..."
if command -v bun >/dev/null; then bun install
elif command -v pnpm >/dev/null; then pnpm install --frozen-lockfile
else npm install --no-audit --no-fund
fi

# 5. Build dengan auto-rollback
info "Build production..."
set +e
if command -v bun >/dev/null; then bun run build; else npm run build; fi
BUILD_EXIT=$?
set -e

if [ "$BUILD_EXIT" -ne 0 ]; then
  err "Build gagal — auto-rollback ke $LOCAL_BEFORE"
  git reset --hard "$LOCAL_BEFORE" || true
  if command -v bun >/dev/null; then bun install || true; else npm install --no-audit --no-fund || true; fi
  if command -v bun >/dev/null; then bun run build || true; else npm run build || true; fi
  END=$(date +%s%3N 2>/dev/null || echo "0")
  emit_json "failed" "${LOCAL_BEFORE:0:7}" "$((END-START_TS))" "build failed, rolled back"
  exit 1
fi
ok "Build selesai"

# 6. Restart
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
  ok "systemd restart"
else
  warn "PM2/systemd tidak terdeteksi. Restart manual."
fi

END=$(date +%s%3N 2>/dev/null || echo "0")
echo "[$(stamp)] update success $NEW_COMMIT" >> "$LOG_FILE"
ok "Update selesai 🎉"
emit_json "success" "$NEW_COMMIT" "$((END-START_TS))" "ok"
