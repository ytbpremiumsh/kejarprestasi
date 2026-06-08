// Public endpoint untuk menyajikan ads.txt dari site_settings.
// Tidak butuh auth, tidak terpengaruh maintenance mode (maintenance hanya di frontend SPA).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "adsense")
      .maybeSingle();

    const cfg = (data?.value ?? {}) as { ads_txt?: string; publisher_id?: string; enabled?: boolean };
    let body = (cfg.ads_txt ?? "").trim();

    // Fallback otomatis bila admin lupa isi tapi sudah ada publisher_id
    if (!body && cfg.publisher_id) {
      const pid = cfg.publisher_id.replace(/^ca-/, "");
      body = `google.com, ${pid}, DIRECT, f08c47fec0942fa0`;
    }

    return new Response(body + "\n", {
      status: 200,
      headers: {
        ...cors,
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (e) {
    return new Response(`# error: ${e instanceof Error ? e.message : "unknown"}\n`, {
      status: 200,
      headers: { ...cors, "Content-Type": "text/plain; charset=utf-8" },
    });
  }
});
