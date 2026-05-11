// Generate QR Code from MPWA (app.ayopintar.com) - admin only proxy
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!role) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json().catch(() => ({}));
    const { data: row } = await supabase.from("site_settings").select("value").eq("key", "whatsapp").maybeSingle();
    const cfg = (row?.value ?? {}) as { api_key?: string; device?: string; qr_endpoint?: string };
    const api_key = body.api_key || cfg.api_key;
    const device = body.device || cfg.device;
    if (!api_key || !device) {
      return new Response(JSON.stringify({ status: false, msg: "Missing api_key/device" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const endpoint = cfg.qr_endpoint || "https://app.ayopintar.com/generate-qr";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key, device, force: true }),
    });
    const json = await res.json().catch(() => ({}));
    return new Response(JSON.stringify(json), { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
