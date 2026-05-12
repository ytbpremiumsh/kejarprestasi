DO $$ BEGIN
  CREATE TYPE public.candidate_status AS ENUM ('pending','approved','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS candidate_status public.candidate_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS candidate_reviewed_at timestamptz;
