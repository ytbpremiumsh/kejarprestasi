
## Tujuan

1. Pendaftar **otomatis menerima email** setelah berhasil mendaftar (Prestasi/Ekonomi) dan setelah berhasil mengirim berkas.
2. Admin bisa **mengedit isi email** (subject + HTML body) dari dashboard, dengan dukungan **placeholder keyword** (mis. `{{full_name}}`, `{{token}}`, `{{kind_label}}`).

---

## 1. Trigger email otomatis

### a. Setelah daftar sukses
Di `src/lib/registration.functions.ts` → setelah `insertRegistration(data)` berhasil, panggil `sendAppEmail` dengan:
- `templateName: "registration-confirmation"`
- `recipientEmail: data.email`
- `idempotencyKey: \`reg-\${token}\``
- `templateData: { fullName, token, kind, whatsapp }`

### b. Setelah kirim berkas sukses
Di `src/lib/berkas.functions.ts` → setelah upsert documents berhasil, panggil `sendAppEmail` dengan:
- `templateName: "berkas-confirmation"`
- `recipientEmail: registrant.email`
- `idempotencyKey: \`berkas-\${token}-\${submittedAt}\``
- `templateData: { fullName (lookup dari registrations), token, kind, count }`

Email dikirim via queue (`enqueue_email`) yang sudah ada — non-blocking, aman dari rate-limit. Jika gagal enqueue, jangan rollback pendaftaran/berkas — cukup `console.error`.

---

## 2. Template email yang bisa diedit admin

### Penyimpanan
Tambah 2 key baru di tabel `site_settings`:
- `email_template_registration` → `{ subject: string, html: string, enabled: boolean }`
- `email_template_berkas` → `{ subject: string, html: string, enabled: boolean }`

Default value disuntik saat pertama dibuka admin (fallback ke HTML bawaan saat ini, sehingga email tetap jalan walau admin belum pernah menyentuh).

### Render dinamis
Refactor `src/lib/email-templates/registry.ts` + `email.functions.ts`:
- Jika `templateName` ∈ {`registration-confirmation`, `berkas-confirmation`}, server function akan:
  1. `SELECT value FROM site_settings WHERE key = 'email_template_…'`
  2. Jika ada custom & `enabled`, gunakan `subject` + `html` dari sana
  3. Lakukan **substitusi placeholder** `{{key}}` → nilai dari `templateData` (sanitize: cuma string replace, tag HTML user-defined OK karena admin yang menulis)
  4. Jika tidak ada custom, fallback ke template React Email lama
- Tetap pakai queue `enqueue_email` yang sudah ada.

### Placeholder yang didukung
| Keyword | Diisi dari |
|---|---|
| `{{full_name}}` | nama pendaftar |
| `{{token}}` | kode pendaftar |
| `{{kind}}` | `prestasi` / `ekonomi` |
| `{{kind_label}}` | "Beasiswa Prestasi" / "Beasiswa Ekonomi" |
| `{{whatsapp}}` | nomor WA (registrasi) |
| `{{count}}` | jumlah berkas (berkas) |
| `{{year}}` | tahun saat ini |
| `{{site_name}}` | "Kejar Prestasi" |

Daftar placeholder ditampilkan di UI admin sebagai chip yang bisa diklik untuk disisipkan ke editor.

---

## 3. Halaman admin baru: `/admin/email-template`

File: `src/routes/admin.email-template.tsx` + entri di `AdminSidebar`.

UI:
- **Tabs**: "Email Pendaftaran" | "Email Pengiriman Berkas"
- Per tab:
  - Toggle **Aktifkan template kustom** (kalau off → pakai default bawaan)
  - Input **Subject** (1 baris, mendukung placeholder)
  - **Editor HTML** (textarea monospace + tombol "Preview")
  - Chip placeholder yang clickable (sisipkan di posisi cursor)
  - Panel **Preview** (render HTML + substitusi data sampel)
  - Tombol **Kirim Test Email** (input email tujuan → trigger `sendAppEmail` pakai data sampel)
  - Tombol **Simpan** (upsert ke `site_settings`)
  - Tombol **Reset ke Default** (hapus row → kembali ke template React Email)

Default HTML disediakan sebagai string siap edit (versi sederhana dari template React Email saat ini), biar admin tidak mulai dari blank.

---

## 4. Detail teknis singkat

- **DB**: tidak perlu migrasi tabel — `site_settings` (`key`, `value jsonb`) sudah ada, RLS admin sudah aktif.
- **Server function baru** `sendTestEmail` (admin-only, pakai `requireSupabaseAuth` + cek role admin) untuk tombol Test.
- **Sanitasi**: substitusi placeholder hanya `String.replaceAll("{{key}}", escapeHtml(value))` untuk nilai dinamis; HTML body itu sendiri tetap apa adanya (dipercaya, hanya admin yang bisa edit).
- **Versi plain text**: digenerate otomatis via `html → text` (strip tag sederhana) supaya field `text` di queue tetap ada.

---

## 5. File yang akan disentuh

```
src/lib/registration.functions.ts   ← trigger email
src/lib/berkas.functions.ts          ← trigger email
src/lib/email.functions.ts           ← support custom template + sendTestEmail
src/lib/email-templates/registry.ts  ← (kecil) expose default HTML strings
src/routes/admin.email-template.tsx  ← halaman editor (BARU)
src/components/admin/AdminSidebar.tsx ← menu "Template Email"
```

Tidak ada perubahan skema DB. Tidak ada perubahan infrastruktur email (queue, domain, cron tetap seperti sekarang).
