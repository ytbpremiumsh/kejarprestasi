
CREATE TYPE public.donation_status AS ENUM ('pending', 'paid', 'failed', 'expired');

CREATE TABLE public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid,
  name text NOT NULL,
  email text NOT NULL,
  whatsapp text,
  amount integer NOT NULL,
  mayar_invoice_id text,
  mayar_link text,
  status public.donation_status NOT NULL DEFAULT 'pending',
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public can submit donation"
  ON public.donations FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(name) BETWEEN 2 AND 200
    AND length(email) BETWEEN 5 AND 200
    AND email LIKE '%_@_%._%'
    AND amount >= 1000
    AND amount <= 100000000
  );

CREATE POLICY "admins view donations"
  ON public.donations FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins update donations"
  ON public.donations FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins delete donations"
  ON public.donations FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER donations_set_updated_at
  BEFORE UPDATE ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.site_settings (key, value)
VALUES (
  'donation',
  jsonb_build_object(
    'enabled', false,
    'title', 'Dukung Program Ini',
    'subtitle', 'Opsional. Tidak memengaruhi seleksi.',
    'description', 'Program Beasiswa Kejar Prestasi berjalan berkat dukungan banyak orang baik. Donasi sekecil apapun sangat berarti untuk membantu adik-adik berikutnya meraih mimpinya.',
    'presets', jsonb_build_array(10000, 25000, 50000, 100000),
    'min_amount', 10000,
    'max_amount', 10000000,
    'thank_you_message', 'Terima kasih atas dukunganmu! Donasimu akan membantu program ini terus berjalan.'
  )
)
ON CONFLICT (key) DO NOTHING;
