
# Refactor ke Vite + React Router SPA

## Tujuan akhir

```
npm install
npm run build
→ dist/index.html + dist/assets/*
```

Output 100% static, deploy dengan `cp -r dist/* /var/www/html/` + Nginx (try_files SPA fallback).

---

## Strategi besar

1. **Ganti build chain**: hapus `@lovable.dev/vite-tanstack-config`, `@tanstack/react-start`, `@cloudflare/vite-plugin`, `@hono/node-server`. Pakai `vite` + `@vitejs/plugin-react` murni.
2. **Ganti routing**: semua `src/routes/*.tsx` → `react-router-dom` v6 dengan `<BrowserRouter>` + `<Routes>`. File route TanStack diubah jadi komponen page biasa di `src/pages/`.
3. **Hapus semua server-side code dari client**:
   - `src/lib/*.functions.ts` → dipindah jadi edge functions baru di `supabase/functions/`
   - `src/routes/api/public/*` (webhook GitHub, WA, health) → edge functions
   - `src/routes/lovable/email/*` (4 file) → edge functions
   - `src/routes/email/unsubscribe.ts` → edge function
   - `src/routes/ads[.]txt.tsx` → endpoint Supabase (file statis fallback)
4. **Komponen yang panggil server fn** diubah memanggil `supabase.functions.invoke()`.
5. **Auth middleware** (`requireSupabaseAuth`) tidak perlu — RLS Supabase sudah aktif, edge function pakai service role + verifikasi JWT user via `supabase.auth.getUser(token)`.
6. **SEO/meta tags** jadi statis di `index.html` saja. Per-page meta tag dinamis pakai `react-helmet-async` (client-side, tidak ideal untuk crawler tapi user sudah setuju).

---

## Tahap 1 — Setup build baru

**File yang dihapus:**
- `wrangler.jsonc`
- `src/server.ts`, `src/server.node.ts`
- `src/start.ts`, `src/router.tsx`, `src/routeTree.gen.ts`
- `src/integrations/supabase/auth-attacher.ts`, `auth-middleware.ts`, `client.server.ts`
- `vite.config.node.ts`, `ecosystem.config.cjs`
- `src/lib/error-capture.ts`, `error-page.ts`
- `src/routes/__root.tsx` (diganti `src/App.tsx`)

**File baru:**
- `vite.config.ts` — pakai `@vitejs/plugin-react` + path alias `@`
- `index.html` di root (entry Vite SPA standar) dengan meta tag statis untuk Kejar Prestasi
- `src/main.tsx` — bootstrap React + BrowserRouter
- `src/App.tsx` — root layout (gantikan `__root.tsx`): SiteHeader, MaintenanceGate, AdminBar, Routes, SiteFooter
- `public/_redirects` (untuk Netlify-style hosting) — opsional
- Nginx config sudah ada di `deploy/nginx-kejarprestasi.id.conf` — perlu di-update jadi static-only (hapus `proxy_pass`, ganti `try_files $uri $uri/ /index.html`)

**package.json scripts:**
```json
"dev": "vite",
"build": "vite build",
"preview": "vite preview"
```

---

## Tahap 2 — Konversi routing (~60 file)

Tiap file `src/routes/<x>.tsx` → `src/pages/<X>Page.tsx`. Pola konversi:

```tsx
// SEBELUM (TanStack)
export const Route = createFileRoute("/beasiswa-ekonomi")({
  head: () => ({ meta: [...] }),
  component: () => <CategoryPage kind="ekonomi" />,
});

// SESUDAH (React Router)
export default function BeasiswaEkonomiPage() {
  useSetMeta({ title: "...", description: "..." });
  return <CategoryPage kind="ekonomi" />;
}
```

Routing table baru di `src/App.tsx`:
```tsx
<Routes>
  <Route path="/" element={<IndexPage />} />
  <Route path="/beasiswa-prestasi" element={<BeasiswaPrestasiPage />} />
  <Route path="/beasiswa-ekonomi" element={<BeasiswaEkonomiPage />} />
  <Route path="/pendaftaran/prestasi" element={<PendaftaranPrestasiPage />} />
  <Route path="/pendaftaran/ekonomi" element={<PendaftaranEkonomiPage />} />
  <Route path="/berkas" element={<BerkasIndexPage />} />
  <Route path="/berkas/prestasi" element={<BerkasPrestasiPage />} />
  <Route path="/berkas/prestasi/upload" element={<BerkasPrestasiUploadPage />} />
  <Route path="/berkas/ekonomi" element={<BerkasEkonomiPage />} />
  <Route path="/berkas/ekonomi/upload" element={<BerkasEkonomiUploadPage />} />
  <Route path="/artikel" element={<ArtikelIndexPage />} />
  <Route path="/artikel/:slug" element={<ArtikelDetailPage />} />
  <Route path="/cek-status" element={<CekStatusPage />} />
  <Route path="/tentang" element={<TentangPage />} />
  <Route path="/daftar" element={<DaftarPage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/bagikan-poster" element={<BagikanPosterIndexPage />} />
  <Route path="/bagikan-poster/prestasi" element={<BagikanPosterPrestasiPage />} />
  <Route path="/bagikan-poster/ekonomi" element={<BagikanPosterEkonomiPage />} />
  <Route path="/pendaftaran/sukses" element={<PendaftaranSuksesPage />} />
  <Route path="/berkas/terkirim" element={<BerkasTerkirimPage />} />
  <Route path="/donasi/terima-kasih" element={<DonasiTerimaKasihPage />} />
  <Route path="/admin/*" element={<AdminLayout />}>
    {/* ~25 admin sub-route */}
  </Route>
  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

**Ganti semua import:**
- `@tanstack/react-router` → `react-router-dom`
- `Link to=...` tetap sama API (`Link` di react-router juga pakai `to`)
- `useNavigate`, `useParams`, `useLocation` → dari `react-router-dom`
- `useRouterState` → `useLocation`
- `Outlet` → dari `react-router-dom`
- Hapus `useServerFn`, `useRouter().invalidate()`

---

## Tahap 3 — Pindahkan server logic ke edge functions

**Edge function baru (yang belum ada):**

| Lama (server fn / route) | Baru (edge function) |
|---|---|
| `src/lib/registration.functions.ts` | `supabase/functions/submit-registration/` |
| `src/lib/berkas.functions.ts` | `supabase/functions/submit-berkas/` |
| `src/lib/email.functions.ts` | `supabase/functions/send-email/` |
| `src/lib/system-update.functions.ts` | `supabase/functions/system-update/` (admin only) |
| `src/routes/api/public/github-webhook.ts` | `supabase/functions/github-webhook/` |
| `src/routes/api/public/wa-webhook.ts` | sudah ada → `supabase/functions/wa-webhook/` |
| `src/routes/api/public/health.ts` | dihapus (nginx /healthz aja) |
| `src/routes/lovable/email/queue/process.ts` | `supabase/functions/email-queue-process/` (cron) |
| `src/routes/lovable/email/transactional/send.ts` | digabung ke `send-email` |
| `src/routes/lovable/email/auth/webhook.ts` | `supabase/functions/auth-email-webhook/` |
| `src/routes/lovable/email/suppression.ts` | `supabase/functions/email-suppression/` |
| `src/routes/email/unsubscribe.ts` | `supabase/functions/email-unsubscribe/` |
| `src/routes/ads[.]txt.tsx` | `supabase/functions/ads-txt/` (atau static di `public/ads.txt`) |

Auth pattern di edge function:
```ts
const authHeader = req.headers.get("Authorization");
const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader?.replace("Bearer ", ""));
if (!user) return new Response("Unauthorized", { status: 401 });
// cek role admin via has_role(user.id, 'admin')
```

Client memanggil dengan:
```ts
const { data, error } = await supabase.functions.invoke("submit-registration", { body: payload });
```

---

## Tahap 4 — Update komponen yang panggil server fn

Sekitar 8-10 komponen yang pakai `useServerFn`:
- `RegistrationForm.tsx` → `supabase.functions.invoke("submit-registration")`
- `BerkasPage.tsx`, upload page → `supabase.functions.invoke("submit-berkas")`
- Admin pages (system-update, email-template) → invoke edge fn dengan auth header

---

## Tahap 5 — Dependency cleanup

**Hapus dari package.json:**
- `@tanstack/react-start`
- `@tanstack/react-router` (atau ganti react-router-dom)
- `@tanstack/react-start-plugin`
- `@lovable.dev/vite-tanstack-config`
- `@cloudflare/vite-plugin`
- `@hono/node-server`
- `wrangler`

**Tambah:**
- `react-router-dom@^6`
- `@vitejs/plugin-react`
- `react-helmet-async` (untuk meta tag per-page)

---

## Tahap 6 — Update Nginx & deploy script

`deploy/nginx-kejarprestasi.id.conf` — hapus upstream Node, jadikan static:
```nginx
server {
  listen 80;
  server_name kejarprestasi.id;
  root /www/wwwroot/kejarprestasi.id;
  index index.html;
  location /assets/ { expires 1y; add_header Cache-Control "public, immutable"; }
  location / { try_files $uri $uri/ /index.html; }
}
```

`deploy/update.sh` — `npm ci && npm run build && rsync dist/ /www/wwwroot/kejarprestasi.id/`. Hapus PM2.

---

## Catatan teknis & risiko

- **SEO halaman publik turun drastis** — meta tag per-page lewat `react-helmet-async` baru ter-inject setelah JS jalan, tidak terbaca crawler tua. Anda sudah setuju.
- **Sharing link (OG image per artikel)** — tidak akan muncul preview kustom di WhatsApp/Twitter, hanya OG image default dari `index.html`.
- **Edge function migration butuh testing** — service role pattern beda dengan TanStack server fn; auth check manual.
- **Lovable Cloud tidak otomatis sinkron** — file edge function harus deploy via `supabase functions deploy`.
- **`Force reload navigation`, `Analytics injector`, dll** — perlu dipasang ulang sebagai hook di App.tsx.
- **Estimasi**: ~80 file diubah/dibuat/dihapus, ~12 edge function baru.

---

## Urutan eksekusi yang saya usulkan

1. Tahap 1 (build chain) — bisa langsung
2. Tahap 5 (deps) — paralel dengan tahap 1
3. Tahap 3 (edge functions) — buat semua dulu
4. Tahap 2 + 4 (routing + komponen) — paling besar
5. Tahap 6 (Nginx) — terakhir

Setelah Anda setujui, saya kerjakan tahap 1+5 dulu, kirim, lalu lanjut tahap berikutnya per batch agar Anda bisa review tiap milestone tanpa kelebihan beban dalam satu turn.

Konfirmasi: **lanjut?** atau ada yang ingin diubah dari rencana ini?
