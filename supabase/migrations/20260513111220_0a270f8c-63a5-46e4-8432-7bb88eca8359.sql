-- Token generator function
CREATE OR REPLACE FUNCTION public.generate_registration_token(p_kind text)
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  prefix text;
  chars text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  candidate text;
  i int;
BEGIN
  prefix := CASE WHEN p_kind = 'prestasi' THEN 'KP-PRE-' ELSE 'KP-EKO-' END;
  LOOP
    candidate := prefix;
    FOR i IN 1..6 LOOP
      candidate := candidate || substr(chars, 1 + floor(random() * length(chars))::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.registrations WHERE token = candidate);
  END LOOP;
  RETURN candidate;
END$$;

-- Add token column
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS token text;

-- Backfill existing rows
UPDATE public.registrations
SET token = public.generate_registration_token(kind::text)
WHERE token IS NULL;

-- Constraints
CREATE UNIQUE INDEX IF NOT EXISTS registrations_token_key ON public.registrations(token);
ALTER TABLE public.registrations ALTER COLUMN token SET NOT NULL;

-- Trigger to auto-generate on insert
CREATE OR REPLACE FUNCTION public.set_registration_token()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.token IS NULL OR NEW.token = '' THEN
    NEW.token := public.generate_registration_token(NEW.kind::text);
  END IF;
  RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS trg_set_registration_token ON public.registrations;
CREATE TRIGGER trg_set_registration_token
BEFORE INSERT ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.set_registration_token();