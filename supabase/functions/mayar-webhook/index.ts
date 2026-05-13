// Mayar webhook receiver — updates donation status when payment received
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: mayarRow } = await supabase.from("site_settings").select("value").eq("key", "mayar_config").maybeSingle();
    const mayar = (mayarRow?.value ?? {}) as { webhook_token?: string };

    // Optional shared-secret guard via query string ?token=...
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    if (mayar.webhook_token && mayar.webhook_token !== token) {
      return new Response("Unauthorized", { status: 401 });
    }

    const payload = await req.json().catch(() => null) as Record<string, unknown> | null;
    if (!payload) return new Response("Bad payload", { status: 400 });

    console.log("mayar-webhook", JSON.stringify(payload).slice(0, 500));

    // Mayar payload shape varies; try common fields
    const event = String((payload.event as string) || (payload.type as string) || "").toLowerCase();
    const data = (payload.data as Record<string, unknown>) || payload;
    const referenceId = (data.referenceId as string) || (data.reference_id as string) || null;
    const invoiceId = (data.id as string) || (data.transaction_id as string) || null;
    const status = String((data.status as string) || "").toLowerCase();

    const isPaid = event.includes("paid") || event.includes("success") || status === "paid" || status === "success" || status === "completed";

    if (!referenceId && !invoiceId) {
      return new Response(JSON.stringify({ ok: false, error: "no reference" }), { status: 400 });
    }

    const update: Record<string, unknown> = {};
    if (isPaid) {
      update.status = "paid";
      update.paid_at = new Date().toISOString();
    } else if (status === "expired") {
      update.status = "expired";
    } else if (status === "failed" || event.includes("fail")) {
      update.status = "failed";
    }

    if (Object.keys(update).length > 0) {
      const q = supabase.from("donations").update(update);
      const { error } = referenceId
        ? await q.eq("id", referenceId)
        : await q.eq("mayar_invoice_id", invoiceId!);
      if (error) console.error("update error", error);
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
});
