
-- Enum untuk kategori beasiswa & status
CREATE TYPE public.scholarship_kind AS ENUM ('prestasi', 'ekonomi');
CREATE TYPE public.registration_status AS ENUM ('pending', 'verified', 'approved', 'rejected');

-- Tabel pendaftaran
CREATE TABLE public.registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kind public.scholarship_kind NOT NULL,
  status public.registration_status NOT NULL DEFAULT 'pending',

  full_name TEXT NOT NULL,
  nik TEXT NOT NULL,
  birth_place TEXT NOT NULL,
  birth_date DATE NOT NULL,
  gender TEXT NOT NULL,
  address TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT NOT NULL,
  education_level TEXT NOT NULL,
  school_name TEXT NOT NULL,
  grade TEXT NOT NULL,

  -- Prestasi
  main_achievement TEXT,

  -- Ekonomi
  parent_income TEXT,
  dependents INT,

  photo_url TEXT,
  student_card_url TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_registrations_kind ON public.registrations(kind);
CREATE INDEX idx_registrations_status ON public.registrations(status);
CREATE INDEX idx_registrations_created_at ON public.registrations(created_at DESC);

-- Tabel berkas tambahan
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id UUID REFERENCES public.registrations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  kind public.scholarship_kind NOT NULL,
  doc_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_registration_id ON public.documents(registration_id);
CREATE INDEX idx_documents_email ON public.documents(email);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_registrations_updated_at
BEFORE UPDATE ON public.registrations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Publik boleh INSERT (form publik), tidak boleh SELECT/UPDATE/DELETE
CREATE POLICY "anyone can submit registration"
  ON public.registrations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "anyone can submit document"
  ON public.documents FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Storage bucket untuk file pendaftar (publik agar mudah dipratinjau)
INSERT INTO storage.buckets (id, name, public)
VALUES ('kp-uploads', 'kp-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage: siapa saja boleh upload & baca dari bucket kp-uploads
CREATE POLICY "kp-uploads public read"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'kp-uploads');

CREATE POLICY "kp-uploads public upload"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'kp-uploads');
