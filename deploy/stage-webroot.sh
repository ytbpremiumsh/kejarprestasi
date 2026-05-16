#!/usr/bin/env bash
# =============================================================
#  Stage static client files ke webroot aaPanel/Nginx.
#  Hanya isi dist/client yang boleh masuk webroot — dist/server tetap
#  dipakai PM2 dari APP_DIR.
# =============================================================
set -e

APP_DIR="${APP_DIR:-/var/www/kejarprestasi}"
WEBROOT="${WEBROOT:-/www/wwwroot/kejarprestasi.id}"
CLIENT_DIR="${APP_DIR}/dist/client"

color() { printf "\033[%sm%s\033[0m\n" "$1" "$2"; }
info()  { color "1;34" "==> $1"; }
ok()    { color "1;32" "✔  $1"; }
err()   { color "1;31" "✖  $1"; }

[ -d "$CLIENT_DIR" ] || { err "${CLIENT_DIR} tidak ada — jalankan npm run build:node dulu"; exit 1; }
[ -d "$CLIENT_DIR/assets" ] || { err "${CLIENT_DIR}/assets tidak ada — build client gagal"; exit 1; }

info "Menyiapkan webroot static fallback: ${WEBROOT}"
mkdir -p "$WEBROOT"

WEBROOT_OWNER="${WEBROOT_OWNER:-}"
if [ -z "$WEBROOT_OWNER" ]; then
  WEBROOT_OWNER="$(stat -c '%u:%g' "$WEBROOT" 2>/dev/null || true)"
fi

# Hapus output yang salah/legacy. Penyebab folder client/ dan server/ muncul
# biasanya karena dist/* disalin mentah ke webroot.
rm -rf \
  "$WEBROOT/client" \
  "$WEBROOT/server" \
  "$WEBROOT/assets" \
  "$WEBROOT/index.html" \
  "$WEBROOT/favicon.ico" \
  "$WEBROOT/robots.txt" \
  "$WEBROOT/manifest.webmanifest" \
  "$WEBROOT/site.webmanifest"

cp -a "$CLIENT_DIR"/. "$WEBROOT"/

# TanStack Start SSR tidak selalu menghasilkan index.html di client build.
# Untuk kebutuhan static fallback/aaPanel file-list, buat fallback eksplisit.
if [ ! -f "$WEBROOT/index.html" ]; then
  cat > "$WEBROOT/index.html" <<'EOF'
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

# Buat favicon.ico valid bila build tidak menyediakannya.
if [ ! -f "$WEBROOT/favicon.ico" ]; then
  node - "$WEBROOT/favicon.ico" <<'NODE'
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

if [ -n "$WEBROOT_OWNER" ] && [ "$(id -u)" = "0" ]; then
  chown -R "$WEBROOT_OWNER" "$WEBROOT"
fi

ok "Webroot OK: assets/, index.html, favicon.ico"
ls -lah "$WEBROOT" | sed -n '1,40p'