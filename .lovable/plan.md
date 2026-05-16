## Akar Masalah

Folder `/www/wwwroot/kejarprestasi.id/` masih terisi karena **halaman dokumentasi admin (`/admin/instalasi/vps` dan `/admin/instalasi/hosting`) belum diperbarui** — masih mengajarkan pola aaPanel lama: clone repo ke `/www/wwwroot/kejarprestasi.id`, build di sana, `bun run build` (Worker), lalu PM2 `npm run start`.

Itu sebabnya:
- `client/` & `server/` muncul langsung di `/www/wwwroot/kejarprestasi.id/` → hasil build TanStack lama dipindah ke webroot.
- Screenshot Anda yang menunjukkan `assets/ index.html favicon.ico` di docs juga **salah** untuk SSR — `index.html` memang tidak pernah ada di SSR.

Backend (`deploy/*.sh`, `ecosystem.config.cjs`, `docs/INSTALL-VPS.md`) sudah betul untuk Node SSR di `/var/www/kejarprestasi`. Yang belum sinkron hanyalah UI dokumentasi di dalam aplikasi.

## Yang Akan Diperbaiki

### 1. `src/routes/admin.instalasi.vps.tsx` — tulis ulang total
Hapus seluruh alur aaPanel + `/www/wwwroot/...` + `bun run build` + `npm run start`. Ganti jadi alur **Node SSR + PM2 + Nginx reverse proxy** yang sesuai dengan `deploy/install-vps.sh`:

Langkah baru (ringkas):
1. Siapkan VPS Ubuntu/Debian, install Node 20+, Nginx, Git, PM2 (installer otomatis)
2. `sudo mkdir -p /var/www && cd /var/www && git clone <REPO> kejarprestasi`
3. Isi `/var/www/kejarprestasi/.env` (Supabase keys + secret server)
4. `sudo REPO_URL=<...> bash deploy/install-vps.sh` → installer otomatis: `npm ci` → `npm run build:node` → validasi `dist/server/server.node.js` → `pm2 start ecosystem.config.cjs`
5. Salin `deploy/nginx-kejarprestasi.id.conf` ke `/etc/nginx/conf.d/` → `nginx -t && systemctl reload nginx`
6. `certbot --nginx -d kejarprestasi.id -d www.kejarprestasi.id` untuk HTTPS
7. **Verifikasi yang benar** (ganti screenshot lama):
   ```
   ls /var/www/kejarprestasi/dist/server/server.node.js   # harus ada
   pm2 status                                              # online
   curl -I http://127.0.0.1:3000                           # 200
   ls /www/wwwroot/kejarprestasi.id                        # KOSONG — itu yang benar
   ```
8. Update: `cd /var/www/kejarprestasi && sudo bash deploy/update.sh`

Tambah callout merah di atas: **"Migrasi dari instalasi lama"** — jika `/www/wwwroot/kejarprestasi.id/` masih berisi `client/`, `server/`, `assets/`, atau `index.html`, jalankan `sudo bash /var/www/kejarprestasi/deploy/migrate-from-static.sh` untuk membersihkannya dan re-point Nginx.

Hapus referensi: aaPanel, `bun run build`, `npm run start`, port `7800`, "Setup Node.js App", `Application startup file: .output/server/index.mjs`.

### 2. `src/routes/admin.instalasi.hosting.tsx` — tandai TIDAK didukung
Shared hosting cPanel **tidak cocok** untuk TanStack Start SSR build ini (tidak ada `.output/server/index.mjs`, build target adalah `dist/server/server.node.js` via `build:node` dengan dependensi cluster PM2 & Nginx reverse proxy). Ganti seluruh isi jadi halaman peringatan singkat:

> "Shared hosting cPanel tidak didukung resmi untuk versi ini. Gunakan VPS (lihat tab VPS). Alasan: aplikasi memerlukan Node 20+, akses sudo untuk PM2 + Nginx reverse proxy, dan tidak menghasilkan file static `.output/...` yang biasa diharapkan cPanel Node App."

Plus link ke tab VPS.

### 3. `src/components/admin/InstallDocs.tsx` — perbaiki path konsisten
Baris 158: `/var/www/kejar-prestasi` (dengan strip) → `/var/www/kejarprestasi` (tanpa strip), agar konsisten dengan seluruh deploy script. Juga ubah daftar "Yang dilakukan script" supaya akurat (validasi build, auto-rollback, bersihkan webroot legacy).

### 4. (Opsional, tidak wajib untuk request ini) `docs/INSTALL-VPS.md`
Sudah betul, tidak diubah.

## Hasil Akhir yang Diharapkan di User

Setelah dokumentasi dirombak + user menjalankan `migrate-from-static.sh`:

```
$ ls -lah /www/wwwroot/kejarprestasi.id
total 8K
drwxr-xr-x  2 www www 4.0K ... .
drwxr-xr-x 23 www www 4.0K ... ..
# kosong — itu memang yang benar, Nginx tidak melayani dari sini lagi

$ ls /var/www/kejarprestasi/dist/server/server.node.js
/var/www/kejarprestasi/dist/server/server.node.js   # ← ada

$ pm2 status
│ kejarprestasi │ online │ cluster │ ...

$ curl -I https://kejarprestasi.id
HTTP/2 200
content-type: text/html; charset=utf-8
```

Tidak ada `client/`, `server/`, atau `index.html` di webroot — itu **fitur**, bukan bug. SSR berarti HTML dirender Node, bukan disajikan dari disk.

## File yang Diubah

1. `src/routes/admin.instalasi.vps.tsx` — tulis ulang (≈180 baris)
2. `src/routes/admin.instalasi.hosting.tsx` — sederhanakan jadi halaman "tidak didukung" (≈40 baris)
3. `src/components/admin/InstallDocs.tsx` — fix path + update daftar fitur script
