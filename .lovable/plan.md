## Tujuan
Implementasi **Titik 1 — Donasi Sukarela Pasca-Daftar** dengan integrasi Mayar (invoice payment), API key Mayar diatur lewat admin dashboard, peserta bebas memasukkan jumlah donasi sendiri.

---

## Alur Pengguna

```
[Submit form pendaftaran berhasil]
        ↓
[Halaman /pendaftaran/sukses]
   ├─ Ucapan terima kasih + info next step (kirim berkas)
   └─ Card "Dukung Program Ini" (opsional, soft-sell)
        ├─ Input nominal bebas (preset chip: 10rb / 25rb / 50rb / 100rb / lainnya)
        ├─ Catatan kecil: "Opsional. Tidak memengaruhi seleksi."
        └─ Tombol "Donasi Sekarang"
              ↓
        [Server function → Mayar /hl/v1/invoice/create]
              ↓
        [Redirect ke Mayar payment link]
              ↓
        [Mayar redirect kembali ke /donasi/terima-kasih]
```

---

## Perubahan UI

### 1. Halaman sukses pendaftaran (baru / refactor)
`src/routes/pendaftaran.sukses.tsx` — landing setelah submit registrasi yang berisi:
- Konfirmasi pendaftaran diterima + nama peserta + langkah berikutnya
- Komponen `<DonationCard />` di bawahnya

`RegistrationForm` setelah submit redirect ke `/pendaftaran/sukses?name=...` (atau pakai sessionStorage). Saat ini kemungkinan langsung ke halaman terkirim — akan disesuaikan.

### 2. Komponen `DonationCard`
`src/components/DonationCard.tsx`
- Heading lembut, copy soft-sell
- Preset nominal (chip): Rp10rb, Rp25rb, Rp50rb, Rp100rb, Lainnya
- Input manual (min Rp10.000)
- Validasi zod: angka, min 10.000, max 10.000.000
- Tombol "Donasi via Mayar" → panggil server function

### 3. Halaman terima kasih donasi
`src/routes/donasi.terima-kasih.tsx` — tampil setelah redirect dari Mayar.

---

## Perubahan Admin Dashboard

### Halaman baru `src/routes/admin.donasi.tsx`
- Form pengaturan integrasi Mayar:
  - **API Key Mayar** (password input, disimpan ke Supabase secret via edge function — bukan di `site_settings` agar tidak ter-expose ke publik)
  - Toggle **Aktifkan donasi**
  - Judul + subjudul + deskripsi card donasi (editable copy)
  - Default nominal preset (CSV)
  - Min & max donasi
- Tabel riwayat donasi (lihat tabel baru di bawah)

Sidebar admin (`AdminSidebar.tsx`) ditambah menu "Donasi".

---

## Perubahan Database

### Tabel baru `donations`
- `id` uuid pk
- `registration_id` uuid nullable (opsional, link ke pendaftar)
- `name`, `email`, `whatsapp` text
- `amount` integer (rupiah)
- `mayar_invoice_id` text
- `mayar_link` text
- `status` enum: `pending` | `paid` | `failed` | `expired` (default `pending`)
- `paid_at` timestamptz nullable
- `created_at`, `updated_at`

**RLS**: insert publik diperbolehkan (siapa saja bisa berdonasi), select hanya admin. Update hanya via service role (edge function webhook).

### `site_settings` key baru `donation`
Menyimpan setting **non-sensitif** saja:
```json
{
  "enabled": true,
  "title": "Dukung Program Ini",
  "subtitle": "Opsional. Tidak memengaruhi seleksi.",
  "description": "...",
  "presets": [10000, 25000, 50000, 100000],
  "min_amount": 10000,
  "max_amount": 10000000
}
```

### Secret `MAYAR_API_KEY`
Disimpan via Lovable Cloud secret, diakses di edge function. Admin set lewat halaman admin → memanggil edge function khusus untuk update secret (atau alternatif: minta user input via tombol "Set API Key" yang membuka prompt secret).

> Catatan: Lovable secrets tidak bisa diupdate dari UI app sendiri. **Solusi praktis**: simpan API key di tabel `site_settings` key `mayar_config` dengan RLS admin-only (select & update hanya admin, tidak ada akses anon). Edge function membaca via service role. Trade-off: API key tersimpan di DB tapi tidak ter-expose ke publik karena RLS ketat.

---

## Edge Functions

### `create-donation`
Input: `{ name, email, whatsapp?, amount, registration_id? }`
Flow:
1. Validasi input (zod).
2. Cek setting `donation.enabled`, validasi amount range.
3. Ambil `MAYAR_API_KEY` dari `site_settings.mayar_config` (service role).
4. POST ke `https://api.mayar.id/hl/v1/invoice/create` dengan header `Authorization: Bearer <key>` dan body Mayar (name, email, amount, mobile, description, redirectUrl, expiredAt 24h).
5. Insert row ke `donations` (status `pending`, simpan invoice id & link).
6. Return `{ link }` ke client → client `window.location.href = link`.

### `mayar-webhook` (`/api/public/mayar-webhook` via edge function)
- Verifikasi signature (Mayar mengirim header signature; kalau tidak ada, gunakan secret token unik di URL sebagai fallback).
- Update `donations.status` jadi `paid` saat event `payment.received`.

URL webhook diisi user di dashboard Mayar.

---

## File yang akan dibuat / diubah

**Baru:**
- `src/routes/pendaftaran.sukses.tsx`
- `src/routes/donasi.terima-kasih.tsx`
- `src/routes/admin.donasi.tsx`
- `src/components/DonationCard.tsx`
- `supabase/functions/create-donation/index.ts`
- `supabase/functions/mayar-webhook/index.ts`
- Migration: tabel `donations` + key `donation` & `mayar_config` di `site_settings`

**Diubah:**
- `src/components/RegistrationForm.tsx` — redirect ke `/pendaftaran/sukses` setelah submit
- `src/components/admin/AdminSidebar.tsx` — tambah menu Donasi
- `supabase/config.toml` — config edge function

---

## Hal yang perlu konfirmasi

1. **Penempatan donation card**: hanya di halaman sukses pendaftaran, atau juga di halaman "berkas terkirim"? (Rekomendasi: dua-duanya, tapi mulai dari sukses pendaftaran dulu.)
2. **Penyimpanan API key**: setuju pakai `site_settings` dengan RLS admin-only (lebih praktis, tetap aman karena tidak ter-expose ke anon)? Atau mau pakai Lovable Cloud secret (lebih aman tapi update key harus lewat dialog secret manual)?
3. **Webhook Mayar**: aktifkan sekarang (perlu user setup webhook URL di dashboard Mayar) atau cukup andalkan redirect success dulu?
