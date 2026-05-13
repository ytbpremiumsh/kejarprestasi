REVOKE EXECUTE ON FUNCTION public.generate_registration_token(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_registration_token() FROM PUBLIC, anon, authenticated;