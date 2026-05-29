# Admin Bar Floating + Maintenance untuk Publik

## Tujuan

1. **Publik (tanpa login)**: Bila Mode Maintenance aktif → hanya melihat halaman maintenance.
2. **Admin (sudah login)**: Tetap bisa menjelajah seluruh halaman publik (`/`, `/beasiswa-ekonomi`, `/beasiswa-prestasi`, `/berkas/*`, `/bagikan-poster/*`, `/tentang`, `/artikel/*`, dll.) walau maintenance aktif, dengan **Admin Bar floating** di atas layar berisi menu konteks cepat.

## Yang sudah berjalan (tidak perlu diubah)

- `MaintenanceGate.tsx` sudah memblokir publik dan melewatkan admin. Logika ini tetap dipakai apa adanya.
- Toggle Mode Maintenance di `/admin/maintenance` sudah berfungsi.

## Yang akan ditambahkan

### 1. Komponen `AdminBar` (baru)

File: `src/components/admin/AdminBar.tsx`

Bar tipis (tinggi ~40px) yang **fixed di atas layar** pada semua halaman publik, hanya muncul jika user adalah admin.

Isi bar (kiri ke kanan):
- Logo/ikon "KP Admin"
- Badge status: **"Mode Maintenance: AKTIF"** (kuning) atau **"Live"** (hijau) — dibaca dari `site_settings.maintenance`
- Dropdown **"Edit Halaman Ini"** — menu kontekstual berdasarkan route saat ini:
  - `/` → Branding, Benefit, FAQ, Info Beasiswa, Timeline, Alumni
  - `/beasiswa-*` → Kategori Beasiswa, Berkas
  - `/berkas/*` → Berkas Builder, Formulir
  - `/bagikan-poster/*` → Bagikan Poster
  - `/artikel/*` → Artikel
  - dan fallback default
- Tombol cepat: **Dashboard**, **Pendaftar**, **Mode Maintenance**, **Pengaturan**
- Sebelah kanan: nama/email admin + tombol **Keluar**
- Tombol toggle mini untuk sembunyikan bar (state disimpan di `localStorage`, bisa dibuka lagi via tombol mengambang di pojok)

Versi mobile: bar tetap muncul, tapi menu konteks dipersempit jadi 1 tombol "Menu Admin" → buka `Sheet` dari `ui/sheet.tsx`.

### 2. Hook `useIsAdmin` (baru)

File: `src/hooks/use-is-admin.ts`

Mengambil session + cek `user_roles.role = admin`. Memakai cache lokal supaya tidak query berulang di tiap navigasi. Subscribe ke `supabase.auth.onAuthStateChange` agar reaktif saat login/logout.

### 3. Integrasi di `__root.tsx`

Tambahkan `<AdminBar />` di dalam `MaintenanceGate` (di luar konten halaman, hanya render kalau admin). Beri padding-top pada body wrapper saat AdminBar terlihat agar konten tidak ketutup.

AdminBar **TIDAK** ditampilkan di route yang diawali `/admin` (sudah ada sidebar sendiri) dan `/login`.

### 4. Banner kecil di halaman maintenance versi admin (opsional kecil)

Saat admin buka situs sementara maintenance aktif, AdminBar sudah menunjukkan badge "Maintenance: AKTIF" → ini sekaligus jadi pengingat publik tidak bisa akses. Tidak perlu komponen tambahan.

## Detail teknis

- **Tidak ada perubahan database** — semua data yang dibutuhkan sudah ada (`user_roles`, `site_settings`).
- **Tidak ada perubahan RLS** — bar hanya menampilkan data dan link, tidak mengubah aturan akses.
- **Styling**: pakai design token (`bg-background`, `border-border`, `bg-primary`, `text-primary-foreground`), tidak ada hex langsung. Bar pakai backdrop blur + border bawah agar elegan menempel di atas hero section.
- **Tidak menyentuh** komponen konten halaman publik — fitur edit tetap dilakukan di dashboard `/admin/*` yang sudah ada. Bar hanya jadi jalan pintas (sesuai pilihan "Bar admin floating dengan menu konteks").

## File yang akan dibuat/disentuh

- **Baru**: `src/components/admin/AdminBar.tsx`
- **Baru**: `src/hooks/use-is-admin.ts`
- **Edit**: `src/routes/__root.tsx` — sisipkan `<AdminBar />` di dalam `MaintenanceGate`, kecualikan route `/admin/*` dan `/login`.

## Tidak termasuk dalam plan ini

- Tidak ada inline text/image editing di halaman publik (sesuai pilihan Anda: "Bar admin floating dengan menu konteks").
- Tidak ada perubahan logika maintenance (sudah benar).
- Tidak menambahkan tabel `site_content` atau CMS mini.

Konfirmasi untuk lanjut ke implementasi.
