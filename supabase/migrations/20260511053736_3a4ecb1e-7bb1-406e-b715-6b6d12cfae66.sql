UPDATE public.site_settings
SET value = '[
  {"date": "2026-05-11", "desc": "Pendaftar mengisi formulir secara online.", "title": "Pendaftaran Dibuka"},
  {"date": "2026-05-15", "desc": "Bagikan poster beasiswa ke media sosial sebagai bagian dari tahapan.", "title": "Bagikan Poster"},
  {"date": "2026-06-10", "desc": "Tim verifikasi memeriksa data pendaftar.", "title": "Seleksi Administrasi"},
  {"date": "2026-06-20", "desc": "Pendaftar mengunggah berkas pendukung.", "title": "Pengumpulan Berkas"},
  {"date": "2026-06-30", "desc": "Validasi berkas dan kelengkapan dokumen.", "title": "Verifikasi"},
  {"date": "2026-07-10", "desc": "Pengumuman finalis penerima beasiswa.", "title": "Pengumuman Finalis"},
  {"date": "2026-07-25", "desc": "Penyerahan beasiswa & merchandise resmi.", "title": "Awarding"}
]'::jsonb
WHERE key = 'timeline';