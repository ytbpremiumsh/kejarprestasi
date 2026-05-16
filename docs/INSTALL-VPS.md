# Install Kejar Prestasi di VPS (Node.js)

Panduan lengkap install di VPS Ubuntu/Debian dengan **Node.js 22** + **PM2** + **Nginx** + **SSL**. Build ini **tidak menggunakan Cloudflare Worker** — murni Node, jadi aman untuk semua fitur (auto-update, child_process, file system, dll).

---

## 1. Prasyarat VPS

- Ubuntu 22.04+ / Debian 12+
- RAM minimal **2GB** (rekomendasi 4GB untuk build lancar)
- Akses root / sudo
- Domain yang sudah pointing A record ke IP VPS

## 2. Install Node.js 22 & Tools

```bash
# Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx

# PM2 (process manager)
sudo npm install -g pm2

# Verifikasi
node -v   # harus v22.x
pm2 -v
```

## 3. Clone & Setup Project

```bash
cd /var/www
sudo git clone https://github.com/USERNAME/REPO.git kejar-prestasi
sudo chown -R $USER:$USER kejar-prestasi
cd kejar-prestasi

# Install dependencies
npm ci

# Buat .env (copy dari template, isi value Anda)
nano .env
```

Isi `.env` minimal:
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
```

## 4. Build (target Node, bukan Worker)

```bash
# Build khusus Node — TIDAK pakai Cloudflare plugin
npm run build:node
```

Output ada di `dist/server/server.node.js`.

> **Catatan OOM:** kalau VPS 2GB dan build crash, jalankan dengan extra heap:
> ```bash
> NODE_OPTIONS="--max-old-space-size=3072" npm run build:node
> ```

## 5. Setup `update.sh` (untuk auto-update)

Webhook auto-update spawn `${APP_DIR}/update.sh`, sementara file aslinya di `public/update.sh`. Buat symlink + permission executable:

```bash
ln -sf public/update.sh update.sh
chmod +x public/update.sh update.sh
```

## 6. Start dengan PM2

```bash
mkdir -p logs
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup     # ikuti instruksi yang muncul
```

Cek: `pm2 status` → harus online.
Logs: `pm2 logs kejar-prestasi`

## 7. Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/kejar-prestasi
```

```nginx
server {
    listen 80;
    server_name domain-anda.com www.domain-anda.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
    }
}
```

Aktifkan + reload:
```bash
sudo ln -s /etc/nginx/sites-available/kejar-prestasi /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## 8. SSL Certbot (HTTPS)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d domain-anda.com -d www.domain-anda.com
```

Auto-renew sudah aktif via systemd timer.

## 9. Auto-Update via GitHub Webhook (Opsional)

Setiap push ke `main` di GitHub bisa otomatis trigger update di VPS. Setup lengkapnya ada di **[`SETUP-GITHUB-WEBHOOK.md`](./SETUP-GITHUB-WEBHOOK.md)**.

Ringkasan: generate secret → simpan ke `site_settings` → tambah webhook di GitHub repo → push commit.

Test manual tanpa webhook:
```bash
bash update.sh
```

Script ini akan: pull → install → `build:node` → restart PM2/systemd, dengan auto-rollback jika build gagal.

> **Alternatif systemd** (tanpa PM2): lihat [`INSTALL-VPS-SYSTEMD.md`](./INSTALL-VPS-SYSTEMD.md).

---

## Troubleshooting

| Masalah | Solusi |
|---|---|
| Build OOM | `NODE_OPTIONS="--max-old-space-size=4096" npm run build:node` |
| Port 3000 sudah dipakai | Edit `PORT` di `.env`, lalu `pm2 restart kejar-prestasi --update-env` |
| Email tidak terkirim | Cek secret Supabase + cek `pm2 logs` |
| Update.sh gagal | Pastikan user PM2 sama dengan user yang clone repo |

## Perintah Sehari-hari

```bash
pm2 status                          # cek status
pm2 logs kejar-prestasi --lines 100 # cek log
pm2 restart kejar-prestasi          # restart
pm2 stop kejar-prestasi             # stop
bash public/update.sh               # update manual
```
