#!/usr/bin/env bash
# =============================================================
#  FORCE stage static client files ke webroot aaPanel/Nginx.
#  Output akhir webroot WAJIB: assets/, index.html, favicon.ico
#  dan TIDAK BOLEH ada client/ atau server/.
# =============================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${APP_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)}"
WEBROOT="${WEBROOT:-/www/wwwroot/kejarprestasi.id}"
DIST_DIR="${APP_DIR}/dist"
if [ -d "${DIST_DIR}/assets" ]; then
  CLIENT_DIR="$DIST_DIR"
else
  CLIENT_DIR="${DIST_DIR}/client"
fi

color() { printf "\033[%sm%s\033[0m\n" "$1" "$2"; }
info()  { color "1;34" "==> $1"; }
ok()    { color "1;32" "✔  $1"; }
warn()  { color "1;33" "!  $1"; }
err()   { color "1;31" "✖  $1"; }

case "$WEBROOT" in
  ""|"/"|"/www"|"/www/wwwroot") err "WEBROOT tidak aman: $WEBROOT"; exit 1 ;;
esac

[ "$WEBROOT" != "$APP_DIR" ] || { err "WEBROOT tidak boleh sama dengan APP_DIR"; exit 1; }
[ "$WEBROOT" != "$DIST_DIR" ] || { err "WEBROOT tidak boleh mengarah ke dist"; exit 1; }
[ -d "$CLIENT_DIR" ] || { err "${CLIENT_DIR} tidak ada — jalankan npm run build:node dulu"; exit 1; }
[ -d "$CLIENT_DIR/assets" ] || { err "${CLIENT_DIR}/assets tidak ada — build client gagal"; exit 1; }

info "Force reset webroot static fallback: ${WEBROOT}"
mkdir -p "$WEBROOT"

WEBROOT_OWNER="${WEBROOT_OWNER:-}"
if [ -z "$WEBROOT_OWNER" ]; then
  WEBROOT_OWNER="$(stat -c '%u:%g' "$WEBROOT" 2>/dev/null || true)"
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

cp -a "$CLIENT_DIR"/. "$TMP_DIR"/
rm -rf "$TMP_DIR/client" "$TMP_DIR/server"

if [ ! -f "$TMP_DIR/index.html" ]; then
  cat > "$TMP_DIR/index.html" <<'EOF'
<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>Kejar Prestasi</title>
  </head>
  <body>
    Kejar Prestasi berjalan sebagai Node.js SSR. Jika halaman ini tampil, Nginx belum diarahkan ke PM2.
  </body>
</html>
EOF
fi

if [ ! -f "$TMP_DIR/robots.txt" ]; then
  printf 'User-agent: *\nAllow: /\n' > "$TMP_DIR/robots.txt"
fi

if [ ! -f "$TMP_DIR/favicon.ico" ]; then
  node - "$TMP_DIR/favicon.ico" <<'NODE'
const fs = require('fs');
const output = process.argv[2];
const width = 16;
const height = 16;
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
const dir = Buffer.alloc(16);
dir[0] = width;
dir[1] = height;
dir[2] = 0;
dir[3] = 0;
dir.writeUInt16LE(1, 4);
dir.writeUInt16LE(32, 6);
const dibSize = 40 + width * height * 4 + height * 4;
dir.writeUInt32LE(dibSize, 8);
dir.writeUInt32LE(header.length + dir.length, 12);
const dib = Buffer.alloc(dibSize);
dib.writeUInt32LE(40, 0);
dib.writeInt32LE(width, 4);
dib.writeInt32LE(height * 2, 8);
dib.writeUInt16LE(1, 12);
dib.writeUInt16LE(32, 14);
dib.writeUInt32LE(width * height * 4, 20);
for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const i = 40 + ((height - 1 - y) * width + x) * 4;
    dib[i] = 99;
    dib[i + 1] = 139;
    dib[i + 2] = 32;
    dib[i + 3] = 255;
  }
}
fs.writeFileSync(output, Buffer.concat([header, dir, dib]));
NODE
fi

if [ "$(id -u)" = "0" ] && command -v chattr >/dev/null 2>&1; then
  chattr -R -i "$WEBROOT/client" "$WEBROOT/server" 2>/dev/null || true
fi

shopt -s dotglob nullglob
for item in "$WEBROOT"/* "$WEBROOT"/.[!.]* "$WEBROOT"/..?*; do
  base="$(basename "$item")"
  case "$base" in
    .|..|.user.ini|.htaccess) continue ;;
  esac
  rm -rf -- "$item"
done
shopt -u dotglob nullglob

cp -a "$TMP_DIR"/. "$WEBROOT"/
rm -rf "$WEBROOT/client" "$WEBROOT/server"

if [ -n "$WEBROOT_OWNER" ] && [ "$(id -u)" = "0" ]; then
  chown -R "$WEBROOT_OWNER" "$WEBROOT"
fi

[ -d "$WEBROOT/assets" ] || { err "Validasi gagal: assets/ tidak ada di webroot"; exit 1; }
[ -f "$WEBROOT/index.html" ] || { err "Validasi gagal: index.html tidak ada di webroot"; exit 1; }
[ -f "$WEBROOT/favicon.ico" ] || { err "Validasi gagal: favicon.ico tidak ada di webroot"; exit 1; }
[ ! -e "$WEBROOT/client" ] || { err "Validasi gagal: client/ masih ada di webroot"; exit 1; }
[ ! -e "$WEBROOT/server" ] || { err "Validasi gagal: server/ masih ada di webroot"; exit 1; }

ok "Webroot bersih: assets/, index.html, favicon.ico — client/ dan server/ sudah dihapus total"
ls -lah "$WEBROOT" | sed -n '1,60p'