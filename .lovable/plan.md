# Rencana: GitHub Webhook Auto-Update + Systemd Alternative

## Status Saat Ini

Webhook endpoint sudah **ada dan lengkap** di `src/routes/api/public/github-webhook.ts`:
- ✅ Verifikasi signature HMAC SHA-256 (header `x-hub-signature-256`)
- ✅ Cek event `push` ke branch `main`/`master`
- ✅ Cek flag `auto_update_enabled` di `site_settings`
- ✅ Spawn `update.sh` + log ke tabel `system_updates`
- ✅ Baca secret dari `site_settings.github_webhook_secret`

Jadi **tidak perlu kode baru** — cukup setup di sisi VPS + GitHub + docs.

Satu issue kecil: webhook melakukan `spawn("bash", ["${APP_DIR}/update.sh"])` tapi file aslinya ada di `public/update.sh`. Saat build, `public/` di-copy ke output, tapi VPS perlu `update.sh` di root `APP_DIR`. Solusinya: symlink saat install.

---

## Yang Akan Dibuat

### 1. `docs/SETUP-GITHUB-WEBHOOK.md`
Step-by-step:
- Generate webhook secret random
- Insert ke `site_settings` via SQL (atau via admin UI kalau ada)
- Tambah webhook di GitHub repo (URL, content-type, secret, event=push)
- Test dengan event "ping"
- Enable `auto_update_enabled` toggle
- Troubleshoot: cek log `pm2 logs`, cek tabel `system_updates`

### 2. `deploy/kejar-prestasi.service` (systemd unit)
Alternative untuk user yang tidak mau PM2:
```text
[Unit]
Description=Kejar Prestasi (Node SSR)
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/kejar-prestasi
ExecStart=/usr/bin/node dist/server/server.node.js
Restart=on-failure
Environment=NODE_ENV=production PORT=3000 HOST=0.0.0.0
EnvironmentFile=/var/www/kejar-prestasi/.env

[Install]
WantedBy=multi-user.target
```

### 3. `docs/INSTALL-VPS-SYSTEMD.md`
Panduan setup dengan systemd (alternatif PM2):
- Install service file
- `systemctl enable/start`
- Cek log via `journalctl -u kejar-prestasi -f`
- Catatan: `update.sh` di-detect otomatis (sudah ada branch `systemctl restart kejar-prestasi`)

### 4. Update `docs/INSTALL-VPS.md`
Tambah section "Setup update.sh location":
```bash
# Pastikan update.sh ada di root project (bukan di public/)
ln -sf public/update.sh update.sh
chmod +x update.sh
```

### 5. Update endpoint URL reference
Webhook URL untuk GitHub:
- VPS user: `https://domain-anda.com/api/public/github-webhook`

---

## Tidak Ada Perubahan Kode Aplikasi

Webhook handler, tabel `system_updates`, dan logic admin UI sudah berfungsi. Murni dokumentasi + 1 systemd unit file.

---

## Pertanyaan Konfirmasi

1. **Saya lanjut bikin semua 4 file di atas** (docs webhook + systemd unit + docs systemd + update INSTALL-VPS.md)?
2. **Symlink atau copy** untuk `update.sh`? Symlink lebih bersih (otomatis ikut git pull), saya rekomendasi symlink.
3. **User systemd**: pakai `www-data` (default Nginx user) atau bikin user khusus `kejarprestasi`? Saya rekomendasi user khusus untuk isolasi permission, tapi `www-data` lebih simpel kalau Anda sudah nyaman.
