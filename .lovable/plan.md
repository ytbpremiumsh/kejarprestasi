## Tujuan
Tampilkan **kode token** peserta di dashboard admin, baik di halaman **Pendaftar** maupun di halaman **Berkas**, agar admin mudah mencocokkan peserta dengan token mereka.

## Perubahan

### 1. `src/routes/admin.pendaftar.tsx`
- Tambah kolom **Kode Token** pada tabel pendaftar (di antara kolom Nama dan Kategori), tampilkan dengan font monospace + tombol copy.
- Pada **DetailDialog**, tampilkan token di bagian header (samping badge kategori) dengan style chip monospace + tombol copy.
- Sertakan token pada hasil pencarian (`q`) supaya admin bisa cari berdasarkan kode token juga.

### 2. `src/routes/admin.berkas.tsx`
- Tambahkan kolom **Token** pada daftar berkas masuk (mengambil dari relasi `registration_id` → `registrations.token`, atau cocokkan via email jika `registration_id` null).
- Tampilkan token dengan style monospace + tombol copy.
- Tambahkan token ke filter pencarian.

### 3. Helper kecil
- Komponen kecil `TokenBadge` (inline di file masing-masing atau `src/components/admin/TokenBadge.tsx`) berisi tampilan kode + tombol copy via `navigator.clipboard` + toast.

## Catatan teknis
- Token sudah ada di tabel `registrations.token` dan sudah di-select di `admin.pendaftar.tsx`. Untuk `admin.berkas.tsx` perlu melakukan join/lookup ke `registrations` (select `id, token, email`) lalu map ke setiap dokumen.
- Tidak ada perubahan database, RLS, atau edge function — murni UI admin.
