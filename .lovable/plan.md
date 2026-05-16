# Rombak Deployment VPS → Node SSR

## Keputusan

- **Process manager**: PM2
- **App path**: `/var/www/kejarprestasi`
- **Nginx**: reverse proxy ke `127.0.0.1:3000`, dengan static fallback untuk `/assets` dari disk
- **Domain**: `kejarprestasi.id`, port `3000`

## Akar Masalah

1. `public/update.sh` ikut ter-publish ke `dist/client/` karena Vite copy semua `public/*` → akhirnya ter-copy ke `/www/wwwroot/kejarprestasi.id/` dan tampil sebagai "deployment". Itu kenapa Nginx root cuma berisi `assets/` + `update.sh`, tanpa `index.html` → 403.
2. Script install lama menyalin `dist/client/*` ke web root aaPanel seolah-olah SPA statis. Padahal app ini **SSR** — `index.html` tidak ada, harus dirender Node.
3. Path tidak konsisten: `/var/www/kejarprestasi` vs `/var/www/kejar-prestasi` vs `/www/wwwroot/kejarprestasi.id`.

## Target Akhir

```text
/var/www/kejarprestasi/          ← app dir (git clone, build, run)
├── dist/server/server.node.js   ← entry Node SSR (PM2 jalankan ini)
├── dist/client/assets/          ← hashed assets (Nginx serve langsung)
├── package.json, node_modules/
├── .env                         ← server secrets
├── ecosystem.config.cjs
└── logs/

/www/wwwroot/kejarprestasi.id/   ← Nginx docroot (KOSONG, hanya untuk /assets alias)
```

Nginx:
- `location /assets/` → `alias /var/www/kejarprestasi/dist/client/assets/;` (cache 1y, immutable)
- `location /` → `proxy_pass http://127.0.0.1:3000;` (semua HTML + API + SSR)

## Perubahan File

### 1. Pindahkan `public/update.sh` → `deploy/update.sh`
Supaya tidak ter-bundle ke `dist/client/` dan tidak public-accessible. Update semua referensi di docs.

### 2. Tulis ulang `deploy/install-vps.sh` (baru, deterministik)
- Cek Node ≥ 20, install via NodeSource jika kurang
- `git clone` / `git pull` ke `/var/www/kejarprestasi`
- `npm ci && npm run build:node`
- **Validasi keras**: file `dist/server/server.node.js` harus ada, kalau tidak → exit 1
- Setup `.env` (prompt jika belum ada)
- `pm2 start ecosystem.config.cjs && pm2 save && pm2 startup`
- **Tidak** menyalin apapun ke `/www/wwwroot/`
- Tulis file Nginx config contoh ke `/etc/nginx/conf.d/kejarprestasi.id.conf.example`

### 3. Tulis ulang `deploy/update.sh`
- `cd /var/www/kejarprestasi && git pull`
- `npm ci --production=false && npm run build:node`
- Validasi `dist/server/server.node.js` ada
- `pm2 reload kejarprestasi` (zero-downtime)
- **Tolak** dan hapus `/www/wwwroot/kejarprestasi.id/update.sh` jika ditemukan

### 4. Tulis ulang `ecosystem.config.cjs`
```js
module.exports = {
  apps: [{
    name: 'kejarprestasi',
    script: 'dist/server/server.node.js',
    cwd: '/var/www/kejarprestasi',
    instances: 'max', exec_mode: 'cluster',
    env: { NODE_ENV: 'production', PORT: 3000, HOST: '127.0.0.1' },
    error_file: 'logs/err.log', out_file: 'logs/out.log',
  }],
};
```

### 5. Tulis ulang `docs/INSTALL-VPS.md`
- Hapus semua jejak aaPanel static-root pattern
- Sertakan contoh Nginx config (lihat di bawah)
- Migrasi: untuk server lama yang sudah punya `/www/wwwroot/kejarprestasi.id/{assets,update.sh}`, jalankan `deploy/migrate-from-static.sh` yang membersihkan folder itu dan re-point Nginx

### 6. `deploy/nginx-kejarprestasi.id.conf` (baru, contoh)
```nginx
server {
  listen 80;
  server_name kejarprestasi.id www.kejarprestasi.id;

  # Static assets — Nginx langsung dari disk
  location /assets/ {
    alias /var/www/kejarprestasi/dist/client/assets/;
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
  }

  # SSR + API + segalanya → Node
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

### 7. `deploy/migrate-from-static.sh` (baru)
Untuk server existing:
```bash
systemctl stop nginx
rm -rf /www/wwwroot/kejarprestasi.id/{assets,update.sh,index.html}
# arahkan ke config baru
cp /var/www/kejarprestasi/deploy/nginx-kejarprestasi.id.conf /etc/nginx/conf.d/
nginx -t && systemctl start nginx
pm2 reload kejarprestasi || pm2 start /var/www/kejarprestasi/ecosystem.config.cjs
```

### 8. Hapus / arsipkan
- `docs/INSTALL-VPS-SYSTEMD.md` → tandai sebagai opsional, bukan path utama
- `deploy/kejar-prestasi.service` → tetap di repo sebagai referensi, tapi PM2 jadi default

## Verifikasi Setelah Install

```bash
ls /var/www/kejarprestasi/dist/server/server.node.js   # harus ada
pm2 status                                              # kejarprestasi: online
curl -I http://127.0.0.1:3000                           # 200
curl -I https://kejarprestasi.id                        # 200 + Content-Type: text/html
curl -I https://kejarprestasi.id/assets/<hash>.js       # 200 + Cache-Control immutable
ls /www/wwwroot/kejarprestasi.id/                       # kosong / tidak relevan
```

## Catatan: Worker tetap untuk Lovable Publish

Build Lovable (`lovable.app`) tetap pakai Cloudflare Worker (config default). Yang dirombak hanya jalur self-host VPS via `build:node`. Dua dunia tetap koeksistensi:
- `npm run build` → Worker (Lovable publish)
- `npm run build:node` → Node SSR (VPS)
