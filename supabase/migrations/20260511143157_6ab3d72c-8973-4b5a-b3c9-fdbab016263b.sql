UPDATE public.site_settings SET value = '[
  {"title":"Pendaftaran Dibuka","desc":"Calon peserta mengisi formulir pendaftaran beasiswa secara online.","date":"2026-11-16"},
  {"title":"Bagikan Poster","desc":"Peserta membagikan poster beasiswa ke media sosial sebagai bagian dari tahapan seleksi.","date":"2026-11-16"},
  {"title":"Berkas Administrasi","desc":"Peserta mengunggah seluruh berkas pendukung sesuai persyaratan yang ditentukan.","date":"2026-11-16"},
  {"title":"Seleksi Administrasi","desc":"Tim panitia memeriksa kelengkapan data dan keabsahan berkas pendaftar.","date":"2026-11-21"},
  {"title":"Verifikasi","desc":"Validasi akhir terhadap dokumen dan data peserta yang lolos administrasi.","date":"2026-11-27"},
  {"title":"Pengumuman Kandidat","desc":"Pengumuman peserta yang lolos sebagai kandidat dan berhak mengikuti TPA.","date":"2026-11-28","singleDay":true},
  {"title":"Tes Potensi Akademik (TPA)","desc":"Peserta mengikuti tes online serentak untuk mengukur kemampuan akademik.","date":"2026-11-29","singleDay":true},
  {"title":"Pengumuman Finalis","desc":"Pengumuman peserta yang lolos sebagai finalis penerima beasiswa.","date":"2026-12-05","singleDay":true},
  {"title":"Awarding","desc":"Penyerahan beasiswa dan merchandise resmi kepada para penerima.","date":"2026-12-19","singleDay":true}
]'::jsonb WHERE key = 'timeline';