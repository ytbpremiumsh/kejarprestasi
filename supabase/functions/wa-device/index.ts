// Device status & disconnect proxy for MPWA (app.ayopintar.com)
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
    if (!user) return json({ error: "unauthorized" }, 401);
    const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!role) return json({ error: "forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const action = (body.action as string) || "status";
    const { data: row } = await supabase.from("site_settings").select("value").eq("key", "whatsapp").maybeSingle();
    const cfg = (row?.value ?? {}) as { api_key?: string; device?: string; qr_endpoint?: string };
    const api_key = body.api_key || cfg.api_key;
    const device = body.device || cfg.device;
    if (!api_key || !device) return json({ status: false, msg: "Missing api_key/device" }, 400);

    if (action === "disconnect") {
      const url = "https://app.ayopintar.com/logout-device";
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ api_key, sender: device }),
      });
      const txt = await r.text();
      let parsed: unknown; try { parsed = JSON.parse(txt); } catch { parsed = { status: r.ok, message: txt.slice(0, 200) }; }
      return json({ ...(parsed as object), upstream_status: r.status });
    }

    // status: hit generate-qr WITHOUT force; if response says already connected => connected
    const base = cfg.qr_endpoint || "https://app.ayopintar.com/generate-qr";
    const qs = new URLSearchParams({ api_key, device });
    const url = `${base}${base.includes("?") ? "&" : "?"}${qs.toString()}`;
    const r = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
    const txt = await r.text();
    let parsed: { status?: boolean; msg?: string; qrcode?: string } = {};
    try { parsed = JSON.parse(txt); } catch { parsed = { status: r.ok, msg: txt.slice(0, 200) }; }
    const msg = (parsed.msg || "").toLowerCase();
    const connected = msg.includes("already connected") || msg.includes("sudah terhubung");
    return json({ connected, raw: parsed, upstream_status: r.status });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
