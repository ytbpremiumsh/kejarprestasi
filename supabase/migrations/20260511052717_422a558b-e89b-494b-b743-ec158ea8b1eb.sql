INSERT INTO public.site_settings (key, value) VALUES
  ('adsense', jsonb_build_object(
    'enabled', false,
    'publisher_id', '',
    'ads_txt', ''
  )),
  ('ad_slots', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;