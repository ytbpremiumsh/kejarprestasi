CREATE TABLE IF NOT EXISTS public.ai_provider_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor text NOT NULL DEFAULT 'lovable_ai',
  api_key text,
  base_url text,
  model text NOT NULL DEFAULT 'google/gemini-3-flash-preview',
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ai_provider_settings_vendor_check CHECK (vendor IN ('lovable_ai', 'openrouter'))
);

ALTER TABLE public.ai_provider_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins can read ai provider settings" ON public.ai_provider_settings;
DROP POLICY IF EXISTS "admins can insert ai provider settings" ON public.ai_provider_settings;
DROP POLICY IF EXISTS "admins can update ai provider settings" ON public.ai_provider_settings;
DROP POLICY IF EXISTS "admins can delete ai provider settings" ON public.ai_provider_settings;

CREATE POLICY "admins can read ai provider settings"
  ON public.ai_provider_settings
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins can insert ai provider settings"
  ON public.ai_provider_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins can update ai provider settings"
  ON public.ai_provider_settings
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins can delete ai provider settings"
  ON public.ai_provider_settings
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS ai_provider_settings_set_updated_at ON public.ai_provider_settings;
CREATE TRIGGER ai_provider_settings_set_updated_at
  BEFORE UPDATE ON public.ai_provider_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.ai_provider_settings (vendor, model, enabled)
SELECT 'lovable_ai', COALESCE((SELECT model FROM public.ai_behavior ORDER BY created_at LIMIT 1), 'google/gemini-3-flash-preview'), true
WHERE NOT EXISTS (SELECT 1 FROM public.ai_provider_settings);