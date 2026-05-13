CREATE OR REPLACE FUNCTION public.generate_registration_token(p_kind text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
END$function$;

CREATE OR REPLACE FUNCTION public.set_registration_token()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.token IS NULL OR NEW.token = '' THEN
    NEW.token := public.generate_registration_token(NEW.kind::text);
  END IF;
  RETURN NEW;
END$function$;

GRANT EXECUTE ON FUNCTION public.generate_registration_token(text) TO anon, authenticated;