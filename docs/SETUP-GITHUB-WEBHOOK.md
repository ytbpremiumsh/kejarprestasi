# Setup GitHub Webhook Auto-Update

Setelah `npm run build:node` jalan di VPS, Anda bisa setup **auto-update** setiap push ke GitHub. Endpoint webhook sudah tersedia di `/api/public/github-webhook`.

## Alur Kerja

```
Anda push ke GitHub
   ↓
GitHub kirim POST ke https://domain-anda.com/api/public/github-webhook
   ↓
Server verifikasi signature HMAC SHA-256
   ↓
Cek flag auto_update_enabled di database
   ↓
Spawn bash update.sh → git pull → build:node → restart PM2
   ↓
Log hasil ke tabel system_updates (cek di admin dashboard)
```

## 1. Generate Webhook Secret

Di VPS, generate string random:

```bash
openssl rand -hex 32
```

Copy output-nya (contoh: `a3f5b8c9d2e1...`). **Simpan baik-baik** — ini dipakai di GitHub & database.

## 2. Simpan Secret + Aktifkan Auto-Update di Database

Buka **Backend → SQL Editor** (atau Lovable Cloud), jalankan:

```sql
-- Simpan webhook secret
INSERT INTO site_settings (key, value)
VALUES ('github_webhook_secret', '{"secret": "PASTE_SECRET_DARI_STEP_1"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- Aktifkan auto-update
INSERT INTO site_settings (key, value)
VALUES ('auto_update_enabled', '{"enabled": true}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
```

Atau pakai admin UI di `/admin/sistem-update` kalau toggle-nya sudah ada.

## 3. Pastikan `update.sh` Bisa Diakses dari Root Project

Webhook spawn `${APP_DIR}/update.sh`, tapi file aslinya di `public/update.sh`. Buat symlink:

```bash
cd /var/www/kejar-prestasi
ln -sf public/update.sh update.sh
chmod +x public/update.sh update.sh
```

## 4. Tambah Webhook di GitHub

1. Buka repo GitHub → **Settings → Webhooks → Add webhook**
2. Isi:
   - **Payload URL**: `https://domain-anda.com/api/public/github-webhook`
   - **Content type**: `application/json`
   - **Secret**: paste secret dari Step 1
   - **SSL verification**: Enable
   - **Which events?**: pilih **"Just the push event"**
   - **Active**: ✅ centang
3. Klik **Add webhook**

GitHub akan otomatis kirim event `ping`. Cek di tab "Recent Deliveries" — harus muncul **Response 200** dengan body `{"ok":true,"pong":true}`.

## 5. Test End-to-End

Push commit dummy ke `main`:

```bash
git commit --allow-empty -m "test webhook"
git push origin main
```

Lalu cek:
- GitHub → Webhook → Recent Deliveries → status 200 dengan body `{"ok":true,"triggered":true}`
- VPS: `pm2 logs kejar-prestasi --lines 50` → ada output `update started`
- Admin dashboard `/admin/sistem-update` → tabel `system_updates` ada row baru dengan status `success`

## 6. Permission untuk User PM2

Pastikan user yang menjalankan PM2/systemd punya:
- Write akses ke `/var/www/kejar-prestasi` (untuk `git pull` & build)
- Akses jalankan `pm2` atau `systemctl restart` (untuk restart service)

Kalau pakai PM2 sebagai user biasa (bukan root), PM2 restart otomatis tanpa sudo.
Kalau pakai systemd, tambah sudoers rule:

```bash
# /etc/sudoers.d/kejarprestasi-restart
kejarprestasi ALL=(ALL) NOPASSWD: /bin/systemctl restart kejar-prestasi
```

## Troubleshooting

| Gejala | Penyebab | Solusi |
|---|---|---|
| `401 Invalid signature` | Secret di GitHub ≠ database | Re-copy secret, pastikan tidak ada whitespace |
| `503 Webhook secret not configured` | Row `site_settings` belum diisi | Jalankan SQL Step 2 |
| `{"ok":true,"autoUpdate":false}` | Flag `auto_update_enabled` masih false | Update row jadi `{"enabled": true}` |
| `501 Self-hosted Node.js required` | Webhook hit ke deployment Lovable (Worker) | Pastikan webhook URL pakai domain VPS, bukan `*.lovable.app` |
| Build sukses tapi PM2 tidak restart | User PM2 beda dengan user webhook | Set env `PM2_NAME` & jalankan PM2 sebagai user yang sama |
| `update.sh: No such file or directory` | Symlink belum dibuat | Step 3: `ln -sf public/update.sh update.sh` |

## Disable Auto-Update Sementara

Toggle off lewat SQL tanpa hapus secret:

```sql
UPDATE site_settings
SET value = '{"enabled": false}'::jsonb
WHERE key = 'auto_update_enabled';
```

Webhook tetap valid, tapi `update.sh` tidak akan dijalankan. Anda bisa update manual lewat tombol di admin dashboard atau `bash update.sh`.

## Keamanan

- ✅ Signature HMAC SHA-256 → request palsu langsung ditolak 401
- ✅ Hanya event `push` ke `main`/`master` yang trigger build
- ✅ Auto-rollback kalau build gagal (commit terakhir di-restore)
- ✅ Log lengkap di tabel `system_updates` (audit trail)
- ⚠️ **Jangan share secret** ke siapapun — ini sekuat password
