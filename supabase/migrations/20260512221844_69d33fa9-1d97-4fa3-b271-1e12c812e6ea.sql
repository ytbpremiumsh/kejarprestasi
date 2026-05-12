DO $$ BEGIN
  CREATE TYPE public.doc_review_status AS ENUM ('pending','approved','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS review_status public.doc_review_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

DROP POLICY IF EXISTS "admins update documents" ON public.documents;
CREATE POLICY "admins update documents"
  ON public.documents FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
