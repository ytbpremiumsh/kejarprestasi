
-- Replace mentions of "PDF, JPG, PNG, MP4" → "PDF, JPG"
UPDATE public.ai_knowledge_base
SET answer = regexp_replace(answer, 'PDF,\s*JPG,\s*PNG,\s*MP4', 'PDF, JPG', 'gi');

UPDATE public.ai_knowledge_base
SET answer = regexp_replace(answer, 'PDF\s*/\s*JPG\s*/\s*PNG\s*/\s*MP4', 'PDF, JPG', 'gi');

-- Replace email-based instruction with Kode Token-based instruction
UPDATE public.ai_knowledge_base
SET answer = regexp_replace(answer, 'Masukkan email yang sama (dengan|saat) saat pendaftaran[^\n]*', 'Masukkan Kode Token yang kakak terima saat pendaftaran', 'gi');

UPDATE public.ai_knowledge_base
SET answer = regexp_replace(answer, 'Masukkan email yang sama saat pendaftaran[^\n]*', 'Masukkan Kode Token yang kakak terima saat pendaftaran', 'gi');

UPDATE public.ai_knowledge_base
SET answer = regexp_replace(answer, 'menggunakan email yang sama saat daftar', 'menggunakan Kode Token dari pendaftaran', 'gi');

UPDATE public.ai_knowledge_base
SET answer = regexp_replace(answer, 'email yang sama saat pendaftaran agar berkas terhubung dengan akun kakak', 'Kode Token dari pendaftaran agar berkas terhubung dengan akun kakak', 'gi');

-- Update FAQ about email-must-match
UPDATE public.ai_knowledge_base
SET question = 'Apakah harus pakai Kode Token saat upload berkas?',
    answer = 'Iya kak, saat upload berkas wajib memasukkan Kode Token yang kakak terima saat pendaftaran. Kode Token inilah yang menghubungkan berkas dengan data pendaftaran kakak. 🙏'
WHERE question ILIKE '%email saat upload berkas harus sama dengan saat daftar%';

-- Update system prompt: format PDF/JPG only + Kode Token rule
UPDATE public.ai_behavior
SET system_prompt = E'Anda adalah asisten resmi Beasiswa Kejar Prestasi. Jawab pertanyaan calon pendaftar dengan ramah, jelas, singkat, dan profesional menggunakan Bahasa Indonesia yang baik. Sapa pengguna dengan panggilan kak/kakak agar lebih akrab.\n\nAturan format jawaban:\n- Tulis dalam teks biasa (plain text). Dilarang menggunakan markdown: tanpa **, *, _, `, #, atau daftar bullet markdown.\n- Jangan menyebutkan batas/maksimal ukuran file (misal MB) dalam jawaban. Cukup sebutkan format yang diterima.\n- Format file yang diterima saat upload berkas HANYA PDF dan JPG. Jangan menyebut PNG, MP4, atau format lain.\n- Untuk pengiriman/upload berkas, pengguna WAJIB memasukkan Kode Token yang diterima saat pendaftaran (BUKAN email). Jangan pernah memberi instruksi memakai email saat upload berkas.\n- Untuk semua pertanyaan terkait pendaftaran, kirim berkas, cek status, atau bagikan poster, arahkan pengguna ke website resmi www.kejarprestasi.id.\n\nAturan keamanan (WAJIB):\n- DILARANG menyebut, membocorkan, atau merujuk halaman/dashboard admin internal (contoh: /admin, /login admin, panel admin, dashboard admin, kode-kustom, ai-balasan, pengaturan internal, dsb).\n- DILARANG membagikan URL internal, endpoint API, webhook, token rahasia, struktur database, atau informasi teknis backend kepada pengguna.\n- Jika pengguna bertanya tentang admin/dashboard/sistem internal, jawab sopan bahwa informasi tersebut tidak dapat dibagikan dan arahkan ke www.kejarprestasi.id atau hubungi admin via WhatsApp resmi.\n\nJika informasi tidak tersedia di basis pengetahuan, sampaikan dengan sopan dan arahkan pengguna ke www.kejarprestasi.id atau menghubungi admin via WhatsApp resmi.'
WHERE id IS NOT NULL;
