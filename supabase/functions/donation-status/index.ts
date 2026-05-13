// Public endpoint to check a donation's payment status by id (uuid)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    let id = url.searchParams.get("id") || "";
    if (!id && (req.method === "POST")) {
      try {
        const body = await req.json();
        id = String(body?.id || "");
      } catch { /* ignore */ }
    }
    if (!UUID_RE.test(id)) return json({ ok: false, error: "Invalid id" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data, error } = await supabase
      .from("donations")
      .select("status")
      .eq("id", id)
      .maybeSingle();
    if (error) return json({ ok: false, error: error.message }, 500);
    return json({ ok: true, status: (data?.status as string) || "pending" });
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : String(e) }, 500);
  }
});

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
