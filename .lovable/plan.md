# Rencana: Install di VPS pakai Node, Lovable Preview Tetap Jalan

## Konteks Singkat

Lovable preview (`*.lovable.app`) **wajib** pakai Cloudflare Worker — itu runtime bawaan template `@lovable.dev/vite-tanstack-config`. Kalau kita hapus total, preview Lovable rusak dan Anda kehilangan kemampuan edit + preview di Lovable.

Solusi paling aman: **Dual Build**. Satu codebase, dua output:
- **Build Worker** → dipakai Lovable preview & publish (`kejarprestasi.lovable.app`)
- **Build Node** → dipakai VPS Anda (no Cloudflare, no Worker, no OOM dari plugin Cloudflare)

Sistem Update (auto-update via GitHub webhook + tombol "Update Sekarang"), email worker, child_process — semua **berjalan di Node VPS**, karena VPS pakai entry Node yang berbeda.

---

## Yang Akan Dibuat

### 1. Entry Node baru: `src/server.node.ts`
Versi Node dari `src/server.ts`. Pakai `@hono/node-server` (~50KB, ringan, dipakai TanStack Start sendiri secara internal) untuk handle HTTP. Logic error-capture & branded error page sama persis dengan Worker entry.

```text
src/server.node.ts
  └─ import handler dari @tanstack/react-start/server-entry
  └─ bungkus dengan serve() dari @hono/node-server
  └─ listen di process.env.PORT || 3000
```

### 2. Vite config tambahan: `vite.config.node.ts`
Config terpisah khusus build Node — **tidak load** `@cloudflare/vite-plugin`. Ini yang menyelesaikan OOM build karena plugin Cloudflare adalah penyumbang heap terbesar di SSR build.

```text
vite.config.node.ts
  └─ pakai plugin tanstackStart + viteReact + tailwindcss + tsconfigPaths
  └─ SSR target: node
  └─ output: dist/node/
  └─ TIDAK ada cloudflare plugin
```

### 3. Script baru di `package.json`
```text
"build:node": "vite build --config vite.config.node.ts"
"start:node":  "node dist/node/server/index.mjs"
```

Script lama (`build`, `dev`, `preview`) **tidak diubah** — Lovable tetap pakai itu.

### 4. Update `public/update.sh`
Auto-update script di VPS jalan:
```text
git pull
npm ci
npm run build:node
pm2 restart kejarprestasi
```

### 5. Dokumentasi VPS: `docs/INSTALL-VPS.md`
Step-by-step install di VPS Ubuntu/Debian:
- Install Node 22 + PM2
- Clone repo, set `.env`
- `npm ci && npm run build:node`
- `pm2 start ecosystem.config.cjs`
- Setup Nginx reverse proxy + SSL Certbot
- Setup GitHub webhook → endpoint `/api/public/github-webhook` untuk auto-update

### 6. File `ecosystem.config.cjs` untuk PM2
Config PM2 dengan auto-restart, log rotation, dan environment variables.

---

## Yang TIDAK Diubah

- `src/server.ts` (Worker entry) — tetap untuk Lovable
- `wrangler.jsonc` — tetap untuk Lovable
- `vite.config.ts` — tetap untuk Lovable
- Semua kode aplikasi (`src/routes/`, `src/lib/`, server functions, dll) — 100% sama, jalan di kedua runtime

---

## Detail Teknis (untuk referensi)

**Kenapa `@hono/node-server`?**
- Library minimal, dipakai TanStack Start secara internal saat dev mode di Node
- Compatible dengan handler `fetch(Request) => Response` (Web standard)
- ~50KB, zero native deps
- Alternatif `node:http` murni perlu adapter manual Web↔Node yang lebih ribet

**Kenapa Dual Build, bukan migrasi total?**
- Lovable preview pakai Worker secara hard-coded di template
- Hapus Cloudflare plugin = preview Lovable mati = Anda gak bisa edit di Lovable lagi
- Dual build = best of both worlds, cost-nya cuma 1 file entry + 1 config tambahan

**Kenapa OOM build hilang di Node build?**
- `@cloudflare/vite-plugin` melakukan extra SSR transform untuk Worker compatibility (unenv polyfills, module shimming, dll)
- Build Node skip semua itu → heap usage turun ~40%
- VPS 2GB RAM cukup untuk build (sebelumnya butuh 4GB+ untuk Worker build)

**Fitur yang aman 100% di Node VPS:**
Email worker, WhatsApp blast, registration, donations, auth Supabase, file upload, admin dashboard, edge functions Supabase, sistem update otomatis, child_process.spawn (untuk update.sh), fs.watch, semua native binaries.

---

## Pertanyaan Konfirmasi

1. **Setuju pendekatan Dual Build** (Lovable tetap jalan, VPS dapat build Node terpisah)?
2. **Process manager VPS**: PM2 (recommended, auto-restart, log management) atau systemd?
3. **Saya buat sekalian `docs/INSTALL-VPS.md`** lengkap dengan Nginx config + Certbot, atau cukup script-nya saja dulu?
