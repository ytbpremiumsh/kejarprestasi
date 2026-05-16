# Rencana: Opsi C — Sistem Auto-Update Kombinasi

## Alur

```text
Lovable Editor ──auto push──▶ GitHub ──┬──▶ Webhook ──▶ VPS (auto-deploy)
                                       └──▶ Tombol "Update" di Admin (manual)
                                              └──▶ Rollback ke versi sebelumnya
```

## Fitur

### 1. Halaman baru `/admin/sistem-update`
- **Card status versi** — commit hash, tanggal, pesan commit, branch
- **Badge "Update tersedia"** — muncul jika ada commit baru di `origin/main` (cek tiap 60 detik)
- **Tombol "Update Sekarang"** — trigger `update.sh`, log realtime via streaming
- **Toggle "Auto-update via webhook"** — ON/OFF, simpan di `site_settings`
- **Card konfigurasi webhook** — URL + secret yang harus di-paste ke GitHub repo, dengan tombol copy
- **Tabel riwayat 20 update terakhir** — waktu, commit, sumber (manual/webhook/rollback), status, durasi, tombol "Lihat log"
- **Tombol "Rollback"** — kembali ke commit sukses sebelumnya

Menu baru di `AdminSidebar`: "Sistem Update".

### 2. Server functions — `src/lib/system-update.functions.ts`
Semua dilindungi `requireSupabaseAuth` + cek role admin:
- `getSystemStatus()` — baca git via `child_process` (commit lokal, commit remote, jumlah commit tertinggal)
- `triggerUpdate()` — spawn `update.sh`, stream output, catat ke DB
- `rollback()` — `git reset --hard <prev_commit>` + rebuild + restart
- `getUpdateHistory()` — query tabel `system_updates`
- `regenerateWebhookSecret()` — generate ulang secret webhook

### 3. Webhook receiver — `src/routes/api/public/github-webhook.ts`
- Verifikasi signature `x-hub-signature-256` (HMAC SHA256, timing-safe)
- Hanya proses event `push` ke branch `main`
- Cek toggle `auto_update_enabled` — kalau OFF, return 200 tapi skip
- Trigger update async, catat hasil di `system_updates`

### 4. Database — migrasi baru
Tabel `system_updates`:
- `commit_hash`, `commit_message`, `branch`
- `trigger_source` (`manual` | `webhook` | `rollback`)
- `status` (`running` | `success` | `failed`)
- `log_output`, `duration_ms`, `triggered_by` (uuid, nullable)
- RLS: hanya admin

Tambah 2 key di `site_settings`:
- `auto_update_enabled` (boolean, default `false`)
- `github_webhook_secret` (text, auto-generated)

### 5. Update `public/update.sh`
- Output JSON di akhir: `{"status":"success","commit":"abc","duration":12345}`
- Auto-rollback jika build gagal (`git reset --hard $LOCAL` + restart versi lama)
- Tulis log dengan timestamp ke `update.log`

### 6. Dokumentasi diperbarui
Di `admin.instalasi.vps.tsx` & `admin.instalasi.hosting.tsx`:
- Step "Setup auto-update": generate secret → copy URL webhook → paste ke GitHub Settings → Webhooks
- Step `sudoers` agar PM2 bisa restart tanpa password

## Batasan (jujur)

1. **Hanya jalan di self-hosted Node.js** — `child_process` tidak tersedia di Cloudflare Worker (Lovable preview). Tombol akan disabled di preview dengan pesan informatif.
2. **Webhook butuh domain publik HTTPS** — GitHub tidak bisa kirim ke localhost.
3. **Auto-rollback hanya cover gagal build** — runtime crash pasca-deploy butuh monitoring terpisah.
4. **Migrasi DB tidak ikut auto-deploy** — kalau commit baru perlu skema baru, harus dijalankan manual dari Lovable.

## File yang akan disentuh

```text
BARU:
- src/routes/admin.sistem-update.tsx
- src/lib/system-update.functions.ts
- src/routes/api/public/github-webhook.ts
- migrasi: tabel system_updates + 2 site_settings keys

DIEDIT:
- src/components/admin/AdminSidebar.tsx
- public/update.sh
- src/routes/admin.instalasi.vps.tsx
- src/routes/admin.instalasi.hosting.tsx
```

## Langkah implementasi
1. Migrasi DB (`system_updates` + settings keys)
2. `system-update.functions.ts` (status, update streaming, rollback, history)
3. Webhook endpoint dengan signature verification
4. Halaman admin `/admin/sistem-update` + integrasi sidebar
5. Update `update.sh` (JSON output + auto-rollback)
6. Update dokumentasi VPS & hosting
7. Test invoke webhook untuk verifikasi flow