-- AI Behavior (singleton config)
CREATE TABLE public.ai_behavior (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_name text NOT NULL DEFAULT 'Asisten Kejar Prestasi',
  tone text NOT NULL DEFAULT 'ramah',
  language text NOT NULL DEFAULT 'id',
  system_prompt text NOT NULL DEFAULT 'Anda adalah asisten resmi Beasiswa Kejar Prestasi. Jawab pertanyaan calon pendaftar dengan ramah, jelas, singkat, dan profesional. Gunakan Bahasa Indonesia yang baik. Jika informasi tidak tersedia di basis pengetahuan, sampaikan dengan sopan dan arahkan pengguna untuk menghubungi admin atau membuka website resmi.',
  model text NOT NULL DEFAULT 'google/gemini-2.5-flash',
  temperature numeric NOT NULL DEFAULT 0.5,
  max_tokens integer NOT NULL DEFAULT 600,
  enabled boolean NOT NULL DEFAULT true,
  fallback_message text NOT NULL DEFAULT 'Mohon maaf, untuk pertanyaan ini silakan hubungi admin kami melalui WhatsApp resmi ya kak. 🙏',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_behavior ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read ai_behavior"
  ON public.ai_behavior FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert ai_behavior"
  ON public.ai_behavior FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update ai_behavior"
  ON public.ai_behavior FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete ai_behavior"
  ON public.ai_behavior FOR DELETE TO authenticated USING (true);

INSERT INTO public.ai_behavior DEFAULT VALUES;

-- AI Knowledge Base (FAQ)
CREATE TABLE public.ai_knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text,
  enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read ai_knowledge_base"
  ON public.ai_knowledge_base FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert ai_knowledge_base"
  ON public.ai_knowledge_base FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update ai_knowledge_base"
  ON public.ai_knowledge_base FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete ai_knowledge_base"
  ON public.ai_knowledge_base FOR DELETE TO authenticated USING (true);

CREATE INDEX ai_kb_enabled_idx ON public.ai_knowledge_base (enabled, sort_order);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER ai_behavior_set_updated_at BEFORE UPDATE ON public.ai_behavior
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER ai_kb_set_updated_at BEFORE UPDATE ON public.ai_knowledge_base
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();