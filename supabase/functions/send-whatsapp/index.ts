// Send WhatsApp notification via MPWA (app.ayopintar.com) gateway
// Public endpoint - called from registration & document submit flows
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Payload = {
  type: "pendaftaran" | "berkas" | "status" | "test";
  full_name?: string;
  email?: string;
  whatsapp?: string; // recipient WA number (pendaftar)
  kind?: "prestasi" | "ekonomi";
  doc_count?: number;
  status?: string;
  to?: string; // override recipient (admin test)
  message?: string; // override message (admin test)
};

function normalizeNumber(raw: string): string {
  let n = (raw || "").replace(/\D/g, "");
  if (n.startsWith("0")) n = "62" + n.slice(1);
  if (n.startsWith("8")) n = "62" + n;
  return n;
}

function buildMessage(p: Payload): string {
  if (p.message) return p.message;
  const k = p.kind === "prestasi" ? "Beasiswa Prestasi" : p.kind === "ekonomi" ? "Beasiswa Ekonomi" : "Beasiswa";
  if (p.type === "pendaftaran") {
    return `*Kejar Prestasi*\n\nHalo ${p.full_name ?? "Pendaftar"}, pendaftaran ${k} Anda telah kami terima.\n\nLangkah berikutnya: silakan kirim berkas pendukung melalui menu *Kirim Berkas* di website.\n\nTerima kasih.`;
  }
  if (p.type === "berkas") {
    return `*Kejar Prestasi*\n\nBerkas ${k} dari email ${p.email ?? "-"} (${p.doc_count ?? 0} file) berhasil kami terima dan sedang dalam tahap verifikasi.\n\nKami akan menghubungi Anda kembali setelah proses selesai.`;
  }
  if (p.type === "status") {
    return `*Kejar Prestasi*\n\nHalo ${p.full_name ?? "Pendaftar"}, status pendaftaran ${k} Anda saat ini: *${p.status ?? "-"}*.`;
  }
  return "Test pesan dari Kejar Prestasi.";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = (await req.json()) as Payload;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: row } = await supabase.from("site_settings").select("value").eq("key", "whatsapp").maybeSingle();
    const cfg = (row?.value ?? {}) as {
      enabled?: boolean;
      api_key?: string;
      device?: string;
      admin_number?: string;
      send_endpoint?: string;
      notify_user?: boolean;
      notify_admin?: boolean;
    };

    if (!cfg.enabled) {
      return new Response(JSON.stringify({ ok: false, skipped: "wa_disabled" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!cfg.api_key || !cfg.device) {
      return new Response(JSON.stringify({ ok: false, error: "missing_config" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const endpoint = cfg.send_endpoint || "https://app.ayopintar.com/send-message";
    const message = buildMessage(body);
    const targets: string[] = [];
    if (body.to) targets.push(body.to);
    else {
      if (cfg.notify_user !== false && body.whatsapp) targets.push(body.whatsapp);
      if (cfg.notify_admin !== false && cfg.admin_number) targets.push(cfg.admin_number);
    }

    const results: Array<{ to: string; ok: boolean; resp?: unknown }> = [];
    for (const raw of targets) {
      const number = normalizeNumber(raw);
      if (!number) continue;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: cfg.api_key,
          sender: cfg.device,
          number,
          message,
        }),
      });
      let json: unknown = null;
      try { json = await res.json(); } catch { /* ignore */ }
      results.push({ to: number, ok: res.ok, resp: json });
    }
    return new Response(JSON.stringify({ ok: true, results }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
