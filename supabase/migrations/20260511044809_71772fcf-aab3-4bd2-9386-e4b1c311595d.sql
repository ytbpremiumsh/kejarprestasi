
-- 1) Fix function search_path
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2) Replace overly-permissive INSERT policies with field-validated ones
DROP POLICY IF EXISTS "anyone can submit registration" ON public.registrations;
DROP POLICY IF EXISTS "anyone can submit document" ON public.documents;

CREATE POLICY "public can submit registration"
  ON public.registrations FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(full_name) BETWEEN 2 AND 200
    AND length(nik) BETWEEN 5 AND 32
    AND length(email) BETWEEN 5 AND 200
    AND email LIKE '%_@_%._%'
    AND length(whatsapp) BETWEEN 6 AND 25
    AND length(address) BETWEEN 5 AND 500
    AND status = 'pending'
  );

CREATE POLICY "public can submit document"
  ON public.documents FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(email) BETWEEN 5 AND 200
    AND email LIKE '%_@_%._%'
    AND length(doc_type) BETWEEN 1 AND 100
    AND length(file_url) BETWEEN 5 AND 1000
  );

-- 3) Remove broad listing policy on storage.objects.
-- Public bucket files are still served via /storage/v1/object/public/<bucket>/<path>.
DROP POLICY IF EXISTS "kp-uploads public read" ON storage.objects;
