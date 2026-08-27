CREATE OR REPLACE FUNCTION public.generate_registration_token(p_kind text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  prefix text;
  candidate text;
BEGIN
  prefix := CASE
    WHEN p_kind = 'prestasi' THEN 'KP3P'
    WHEN p_kind = 'ekonomi' THEN 'KP3E'
    WHEN p_kind = 'umum' THEN 'KP3U'
    ELSE 'KP3U'
  END;
  LOOP
    candidate := prefix || lpad(floor(random() * 1000000)::int::text, 6, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.registrations WHERE token = candidate);
  END LOOP;
  RETURN candidate;
END
$function$;

COMMENT ON FUNCTION public.generate_registration_token(text) IS
'Generates registration numbers in KP3P/KP3E/KP3U + six digit format. Existing legacy tokens remain valid.';
