// Public endpoint: list recent paid donations (privacy-safe)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await supabase
      .from("donations")
      .select("name, amount, paid_at")
      .eq("status", "paid")
      .order("paid_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    const items = (data ?? []).map((d) => ({
      name: maskName(d.name || "Anonim"),
      amount: d.amount,
      paid_at: d.paid_at,
    }));

    const { data: totals } = await supabase
      .from("donations")
      .select("amount")
      .eq("status", "paid");
    const total = (totals ?? []).reduce((s, r) => s + (r.amount || 0), 0);
    const count = (totals ?? []).length;

    return new Response(JSON.stringify({ ok: true, items, total, count }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

function maskName(full: string): string {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) {
    const w = parts[0];
    return w.length <= 2 ? w : w[0] + "***" + w.slice(-1);
  }
  const first = parts[0];
  const last = parts[parts.length - 1];
  const masked = last.length <= 2 ? last[0] + "*" : last[0] + "***";
  return `${first} ${masked}`;
}
