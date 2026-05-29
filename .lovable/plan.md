Modernisasi tampilan chart admin dashboard di `src/components/admin/DashboardCharts.tsx` agar lebih profesional dan tidak terkesan klasik.

## Perubahan visual

**Palet warna baru (semantic tokens):**
- Prestasi → `hsl(var(--primary))` dengan gradient ke versi lebih terang
- Ekonomi → warna sekunder modern (teal/indigo) dengan gradient
- Grid lebih halus (dashed, opacity rendah), axis tanpa garis tebal
- Tooltip custom: rounded-xl, shadow lembut, background `--popover`, border tipis

**Pie Chart (Distribusi Kategori):**
- Ubah jadi **Donut chart** (innerRadius 60, outerRadius 95) — lebih modern
- `paddingAngle: 4`, `cornerRadius: 6` untuk segmen membulat
- Label di tengah donut: total angka + label "Total Pendaftar"
- Legend custom di bawah dengan dot + persentase
- Hilangkan label garis ke samping (yang menampilkan "7" dan "1" mencuat) — pindah ke tooltip + center label

**Line Chart (Pendaftar per Hari):**
- Tambah `Area` gradient di bawah line (fade primary → transparent)
- Line tebal 2.5, dot hanya muncul saat hover (activeDot)
- Axis label muted, tickLine dihilangkan
- Margin atas agar tidak mepet

**Bar Chart (Pendaftar per Jenjang):**
- Bar dengan gradient vertikal + `radius={[8,8,0,0]}` di top stack
- Lebar bar dibatasi (`maxBarSize: 48`) agar tidak gemuk
- Spacing antar kategori lebih lega
- Legend custom dengan dot bulat

**Card wrapper (di `admin.index.tsx` jika perlu):**
- Tidak diubah strukturnya, hanya chart internal yang dirombak

## Catatan teknis
- Semua warna pakai semantic tokens (`--primary`, `--accent`, `--muted-foreground`, `--border`, `--popover`) — tidak ada hex hardcoded
- Tambah `<defs><linearGradient/></defs>` di tiap chart untuk efek gradient
- Custom `Tooltip` content component yang konsisten di 3 chart
- Tidak ada perubahan data/logic, murni presentasi

File yang diubah: hanya `src/components/admin/DashboardCharts.tsx`.