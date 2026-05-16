
CREATE TYPE public.update_trigger_source AS ENUM ('manual', 'webhook', 'rollback');
CREATE TYPE public.update_status AS ENUM ('running', 'success', 'failed');

CREATE TABLE public.system_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commit_hash text,
  commit_message text,
  branch text NOT NULL DEFAULT 'main',
  trigger_source public.update_trigger_source NOT NULL,
  status public.update_status NOT NULL DEFAULT 'running',
  log_output text,
  duration_ms integer,
  triggered_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.system_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read system_updates" ON public.system_updates
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins insert system_updates" ON public.system_updates
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins update system_updates" ON public.system_updates
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_system_updates_updated_at
  BEFORE UPDATE ON public.system_updates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_system_updates_created_at ON public.system_updates (created_at DESC);
