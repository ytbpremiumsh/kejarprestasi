# Sistem Kode Token Pendaftar

Tambahkan kode unik per pendaftar (format `KP-PRE-7F3K9D` / `KP-EKO-XXXXXX`) sebagai "tiket" untuk kirim berkas dan cek status.

## 1. Database

Migration baru pada tabel `registrations`:
- Tambah kolom `token` (text, unique, nullable awalnya)
- Index pada `token`
- Backfill token untuk pendaftar lama (`KP-PRE/EKO-XXXXXX`)
- Set NOT NULL setelah backfill
- Fungsi `generate_registration_token(kind)` di Postgres → dipanggil via trigger `BEFORE INSERT` agar setiap pendaftar baru otomatis dapat token unik (retry kalau collision)

Format kode:
- Prefix: `KP-PRE-` (prestasi) / `KP-EKO-` (ekonomi)
- 6 karakter alfanumerik random uppercase, exclude karakter ambigu (0/O, 1/I/L)
- Contoh: `KP-PRE-7F3K9D`

## 2. Halaman Sukses Pendaftaran

`src/routes/pendaftaran.sukses.tsx`:
- Tampilkan KODE TOKEN dengan style menonjol (box besar, monospace, tombol "Salin")
- Pesan jelas: "Simpan kode ini — wajib untuk kirim berkas & cek status"
- Token diambil dari query param (dikirim oleh RegistrationForm setelah insert berhasil)

## 3. Notifikasi WhatsApp

Update template default di `supabase/functions/send-whatsapp/index.ts`:
- `pendaftaran_user`: tambah variabel `{token}` — sertakan kode di pesan WA
- `pendaftaran_admin`: tambah `{token}` juga supaya admin tahu
- Tambah ke `buildMessage` vars

Update `RegistrationForm.tsx` agar setelah insert, ambil `token` dari row hasil insert (`.select("token").single()`) lalu kirim ke send-whatsapp + redirect ke `/pendaftaran/sukses?...&token=...`.

## 4. Gating Halaman Berkas

Refactor `src/components/BerkasPage.tsx` (dan `BerkasInfoPage` kalau perlu):
- Ganti UI lookup dari "input email" → "input KODE TOKEN"
- Update edge function `lookup-pendaftar` (atau buat baru `verify-token`):
  - Input: `{ token, kind }`
  - Cari registrant by `token` + `kind`
  - Return data registrant (full_name, school, dll) sama seperti sekarang
  - Mask WA tetap
- Form upload baru terbuka setelah token valid
- Error message: "Kode tidak ditemukan. Cek kembali kode dari WhatsApp/halaman sukses kamu."
- Tombol "Lupa kode?" → arahkan hubungi admin via WA

## 5. Halaman Cek Status (Baru)

Route baru `src/routes/cek-status.tsx`:
- Form input: kode token
- Edge function baru `cek-status-pendaftar`:
  - Input: `{ token }`
  - Return: nama (sebagian dimask), jenis beasiswa, status pendaftaran (`pending/approved/rejected`), candidate_status, jumlah berkas masuk, status berkas (pending/approved/rejected count)
- UI:
  - Card status dengan badge warna (pending=kuning, approved=hijau, rejected=merah)
  - Timeline 3 langkah: Pendaftaran ✓ → Berkas (✓/⏳) → Hasil (⏳/✓/✗)
  - Kalau berkas belum dikirim → CTA tombol ke `/berkas/{kind}` (auto-isi token)
- Tambah link "Cek Status" di `SiteHeader` & `SiteFooter`
- SEO head() lengkap

## 6. Admin

`src/routes/admin.pendaftar.tsx`:
- Tambah kolom "Kode" di tabel pendaftar
- Tombol "Salin kode" per row
- Kolom kode masuk ke export Excel/CSV

## Detail Teknis

```text
Flow baru:
Daftar → trigger DB generate token → halaman sukses tampilkan token + WA terkirim dengan token
         ↓
User buka /berkas/prestasi → input "KP-PRE-7F3K9D" → verify-token → form upload terbuka
         ↓
User buka /cek-status → input token → lihat progress timeline
```

Edge functions:
- Update `lookup-pendaftar` → terima `token` instead of `email` (atau bikin function baru `verify-token` & deprecate lookup yang lama)
- Buat `cek-status-pendaftar` baru

Token generator (PL/pgSQL):
```sql
create or replace function generate_registration_token(p_kind text)
returns text language plpgsql as $$
declare
  prefix text;
  chars text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  candidate text;
  i int;
begin
  prefix := case when p_kind = 'prestasi' then 'KP-PRE-' else 'KP-EKO-' end;
  loop
    candidate := prefix;
    for i in 1..6 loop
      candidate := candidate || substr(chars, 1 + floor(random() * length(chars))::int, 1);
    end loop;
    exit when not exists (select 1 from registrations where token = candidate);
  end loop;
  return candidate;
end$$;
```

Trigger `BEFORE INSERT` set `NEW.token := generate_registration_token(NEW.kind::text)` jika NULL.

## Out of scope (bisa nanti)
- Email pengiriman token (sekarang WA + halaman sukses cukup)
- Reset/regenerate token oleh user (sementara via admin)
- Rate limiting endpoint verify (bisa ditambah kalau perlu)
