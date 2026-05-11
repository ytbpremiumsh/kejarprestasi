INSERT INTO public.site_settings (key, value) VALUES
  ('custom_code', jsonb_build_object('head', '', 'body', '')),
  ('performance', jsonb_build_object('lite_mode', false, 'disable_ads', false, 'disable_animations', false))
ON CONFLICT (key) DO NOTHING;