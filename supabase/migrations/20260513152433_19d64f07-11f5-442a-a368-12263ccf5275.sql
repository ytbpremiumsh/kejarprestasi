
-- Add WhatsApp auto-reply config to ai_behavior
ALTER TABLE public.ai_behavior 
  ADD COLUMN IF NOT EXISTS wa_auto_reply boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS wa_webhook_token text;

-- Generate a webhook token for any existing row that doesn't have one
UPDATE public.ai_behavior SET wa_webhook_token = encode(gen_random_bytes(16), 'hex') WHERE wa_webhook_token IS NULL;

-- Table riwayat pesan WhatsApp (incoming/outgoing) untuk balasan AI
CREATE TABLE IF NOT EXISTS public.wa_chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone text NOT NULL,
  contact_name text,
  direction text NOT NULL CHECK (direction IN ('in','out')),
  message text NOT NULL,
  ai_used boolean NOT NULL DEFAULT false,
  matched_kb_id uuid,
  status text NOT NULL DEFAULT 'received',
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wa_chat_messages_phone ON public.wa_chat_messages(phone);
CREATE INDEX IF NOT EXISTS idx_wa_chat_messages_created ON public.wa_chat_messages(created_at DESC);

ALTER TABLE public.wa_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins view wa chat" ON public.wa_chat_messages FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins delete wa chat" ON public.wa_chat_messages FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- INSERT/UPDATE only via service role (edge function); no client policy needed.
