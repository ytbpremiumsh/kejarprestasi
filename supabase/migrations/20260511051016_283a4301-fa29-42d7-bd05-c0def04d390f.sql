CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public can read site settings"
ON public.site_settings FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "admins can insert site settings"
ON public.site_settings FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "admins can update site settings"
ON public.site_settings FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "admins can delete site settings"
ON public.site_settings FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE TRIGGER trg_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.site_settings (key, value) VALUES
  ('countdown', jsonb_build_object(
    'deadline', (now() + interval '30 days')::text,
    'title', 'Pendaftaran Ditutup Dalam',
    'subtitle', 'Jangan lewatkan kesempatan meraih beasiswa hingga Rp23.000.000/semester'
  )),
  ('timeline', jsonb_build_array(
    jsonb_build_object('title','Pendaftaran Dibuka','desc','Pendaftar mengisi formulir secara online.','date',(now())::date::text),
    jsonb_build_object('title','Seleksi Administrasi','desc','Tim verifikasi memeriksa data pendaftar.','date',(now()+interval '30 days')::date::text),
    jsonb_build_object('title','Pengumpulan Berkas','desc','Pendaftar mengunggah berkas pendukung.','date',(now()+interval '40 days')::date::text),
    jsonb_build_object('title','Verifikasi','desc','Validasi berkas dan kelengkapan dokumen.','date',(now()+interval '50 days')::date::text),
    jsonb_build_object('title','Pengumuman Finalis','desc','Pengumuman finalis penerima beasiswa.','date',(now()+interval '60 days')::date::text),
    jsonb_build_object('title','Awarding','desc','Penyerahan beasiswa & merchandise resmi.','date',(now()+interval '75 days')::date::text)
  ));