
# Mayar Webhook Hub — Plan Diskusi

## Tujuan
Membuat **1 project Lovable baru** (sebut saja `mayar-hub`) yang:
1. Menerima webhook dari **3 akun Mayar berbeda** lewat **1 URL webhook saja per akun** (URL hub-nya sama, dibedakan token).
2. Menyimpan & menampilkan **semua transaksi 3 website di 1 dashboard admin terpusat**.
3. Meneruskan (forward) notifikasi ke project tujuan masing-masing (Langganan / Donasi / Pembayaran) supaya database lokal mereka tetap update.

> Catatan penting: Mayar tetap butuh URL webhook diisi di tiap dashboard akun. Yang kita hemat: kamu cukup punya **1 codebase webhook** + **1 panel monitoring**, bukan 3.

---

## Arsitektur

```text
   ┌─────────────────┐       ┌──────────────────────────────┐       ┌──────────────────┐
   │ Mayar Akun A    │──────▶│                              │──────▶│ Project A        │
   │ (Langganan)     │       │   MAYAR HUB (project baru)   │       │ (Langganan DB)   │
   └─────────────────┘       │                              │       └──────────────────┘
                             │  /api/public/mayar           │
   ┌─────────────────┐       │     ?site=A&token=xxx        │       ┌──────────────────┐
   │ Mayar Akun B    │──────▶│                              │──────▶│ Project B        │
   │ (Donasi)        │       │  - Verifikasi token          │       │ (Donasi DB)      │
   └─────────────────┘       │  - Simpan ke DB hub          │       └──────────────────┘
                             │  - Forward ke target site    │
   ┌─────────────────┐       │  - Tampilkan di dashboard    │       ┌──────────────────┐
   │ Mayar Akun C    │──────▶│                              │──────▶│ Project C        │
   │ (Pembayaran)    │       └──────────────────────────────┘       │ (Pembayaran DB)  │
   └─────────────────┘                                              └──────────────────┘
```

---

## Yang dibangun di project HUB

### 1. Database hub (Supabase di project hub)

Tabel `sites` — daftar website yang terhubung:
- `slug` (siteA, siteB, siteC)
- `name` (label tampilan: "Langganan", "Donasi", "Pembayaran")
- `kind` (enum: subscription | donation | payment)
- `forward_url` (URL endpoint di project tujuan, misal `https://xxx.supabase.co/functions/v1/mayar-receive`)
- `forward_secret` (token yang dikirim ke project tujuan untuk verifikasi)
- `incoming_token` (token yang harus ada di query webhook Mayar untuk site ini)
- `enabled` (on/off)

Tabel `transactions` — semua transaksi 3 site disimpan di sini:
- `site_slug`, `kind`, `mayar_invoice_id`, `reference_id`, `customer_name`, `customer_email`, `amount`, `status`, `event_type`, `raw_payload` (jsonb), `received_at`

Tabel `forward_logs` — log hasil forward ke project tujuan:
- `transaction_id`, `target_url`, `http_status`, `response_body`, `attempt`, `succeeded`, `created_at`

### 2. Endpoint webhook (server route TanStack)

`/api/public/mayar` — POST:
- Ambil `?site=<slug>&token=<token>` dari query
- Lookup `sites` → cocokkan token, tolak jika invalid
- Simpan payload mentah ke `transactions`
- Coba POST ke `forward_url` site tersebut, simpan hasilnya ke `forward_logs`
- Return 200 ke Mayar (supaya tidak retry sia-sia, walaupun forward gagal — kita retry sendiri)

### 3. Dashboard admin terpusat (di hub)

Halaman-halaman:
- **`/admin/sites`** — kelola 3 site (tambah/edit slug, forward URL, token, on/off). Form ini yang men-generate URL webhook yang harus dipaste user ke dashboard Mayar masing-masing akun.
- **`/admin/transactions`** — tabel semua transaksi gabungan, filter by site, by kind, by status, search by email/invoice. Klik baris → lihat raw payload + forward log.
- **`/admin/forward-logs`** — riwayat forward gagal, tombol "retry" manual.
- **`/admin/dashboard`** — ringkasan: total transaksi 7 hari terakhir per site, total nominal paid, pie chart per kind.

### 4. Auth admin
Login standar Supabase + tabel `user_roles` (admin only) — pola yang sama seperti project sekarang.

---

## Yang dibangun di tiap PROJECT TUJUAN (A, B, C)

Tiap project tujuan tinggal punya **1 endpoint penerima** sederhana:

`/api/public/mayar-receive` — POST:
- Verifikasi `Authorization: Bearer <forward_secret>` (dikirim hub)
- Update tabel lokal (`subscriptions` / `donations` / `payments`) berdasarkan `reference_id` atau `mayar_invoice_id` di payload
- Return 200

Untuk **project ini (Donasi)** yang sudah ada: cukup tambah endpoint `mayar-receive` baru atau modifikasi `mayar-webhook` yang ada agar terima dari hub (bukan langsung dari Mayar). Setting Mayar di project ini di-disable, diganti pointer ke hub.

---

## Flow saat ada pembayaran masuk

1. User bayar di Mayar untuk **Donasi** (akun Mayar B)
2. Mayar POST ke `https://mayar-hub.lovable.app/api/public/mayar?site=siteB&token=xxx`
3. Hub: verifikasi token → simpan ke `transactions` (site_slug=siteB, kind=donation)
4. Hub: lookup `sites.forward_url` siteB → POST payload + `Bearer <forward_secret>` ke project Donasi
5. Project Donasi: update tabel `donations.status = paid`
6. Hub: simpan respons di `forward_logs`
7. Admin buka `/admin/transactions` di hub → lihat transaksi baru muncul realtime

---

## Detail teknis (untuk referensi internal)

- **Stack hub:** sama dengan project ini — TanStack Start + Lovable Cloud (Supabase) + shadcn.
- **Endpoint webhook** pakai server route `/api/public/*` (bypass auth, aman karena ada token check).
- **Forward retry:** versi awal: hub retry 3x dengan exponential backoff dalam request handler. Versi lanjut: pakai pg_cron untuk retry `forward_logs` yang gagal.
- **Realtime dashboard:** Supabase Realtime pada tabel `transactions`.
- **Storage payload:** kolom `raw_payload jsonb` — full payload Mayar disimpan untuk audit & re-process.
- **Idempotency:** unique index `(site_slug, mayar_invoice_id, event_type)` untuk cegah duplicate insert kalau Mayar retry.

---

## Perubahan di project Donasi (yang sekarang)

Minimal:
- Webhook `mayar-webhook` di-update agar bisa terima dari hub: cek `Authorization: Bearer <forward_secret>` selain token query lama (back-compat).
- Di Mayar dashboard akun donasi, ganti URL webhook ke URL hub.
- Field `webhook_token` di admin sekarang bisa dipakai sebagai `forward_secret` (token antara hub→project).

---

## Trade-off & risiko

**✅ Untung:**
- 1 panel pantau semua transaksi 3 bisnis
- 1 codebase webhook → bug fix sekali
- Audit log lengkap (raw payload + forward log)
- Mudah tambah site ke-4 nanti (cukup insert row di `sites`)

**⚠️ Hati-hati:**
- Hub jadi **single point of failure**. Mitigasi: Lovable Cloud uptime tinggi + Mayar biasanya retry kalau webhook timeout.
- Setiap Mayar webhook tetap perlu disetting per akun (3x setting URL di Mayar) — ini batasan Mayar, bukan kita.
- Latency tambah ~200ms (Mayar → Hub → Project). Tidak masalah untuk webhook.

---

## Pertanyaan terakhir sebelum eksekusi

Karena ini **project Lovable baru**, langkah selanjutnya:

1. **Saya tidak bisa bikin project baru otomatis dari sini** — kamu perlu klik "+ New Project" di sidebar Lovable, namai (misal `mayar-hub`), aktifkan Lovable Cloud, lalu di chat pertama project itu, paste plan ini & saya bangun di sana.
2. Setelah hub jadi, balik ke project Donasi ini, saya update webhook handler-nya agar terima dari hub.

Mau lanjut dengan flow ini? Atau ada bagian arsitektur yang mau diubah dulu (misal mau dashboard pantaunya **di project ini** saja, bukan project terpisah)?
