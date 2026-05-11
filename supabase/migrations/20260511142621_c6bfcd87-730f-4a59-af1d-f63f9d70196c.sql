INSERT INTO public.site_settings (key, value) VALUES ('timeline', '[
  {"title":"Pendaftaran Dibuka","desc":"Pendaftaran berlangsung selama 6 bulan (11 Mei – 11 November 2026). Isi formulir pendaftaran secara online.","date":"2026-05-11"},
  {"title":"Bagikan Poster","desc":"Mulai 7 hari setelah pendaftaran dibuka (18 Mei – 11 November 2026). Bagikan poster beasiswa ke media sosial.","date":"2026-05-18"},
  {"title":"Berkas Administrasi","desc":"Mulai 7 hari setelah pendaftaran dibuka (18 Mei – 11 November 2026). Unggah berkas pendukung sesuai persyaratan.","date":"2026-05-18"},
  {"title":"Seleksi Administrasi","desc":"Tim verifikasi memeriksa data & berkas pendaftar (12 – 21 November 2026).","date":"2026-11-12"},
  {"title":"Verifikasi","desc":"Validasi akhir berkas dan kelengkapan dokumen (23 – 28 November 2026).","date":"2026-11-23"},
  {"title":"Tes Potensi Akademik (TPA)","desc":"Tes online serentak — Minggu, 29 November 2026.","date":"2026-11-29"},
  {"title":"Pengumuman Finalis","desc":"Pengumuman finalis penerima beasiswa (Selasa, 8 Desember 2026).","date":"2026-12-08"},
  {"title":"Awarding","desc":"Penyerahan beasiswa & merchandise resmi (Sabtu, 19 Desember 2026).","date":"2026-12-19"}
]'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;