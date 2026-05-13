// WhatsApp Inbound Webhook -> AI Reply
// Public endpoint. Configure your WA gateway (MPWA / app.ayopintar.com) to POST
// incoming chat messages to:
//   https://<project-ref>.functions.supabase.co/wa-webhook?token=<wa_webhook_token>
//
// The token is generated per AI behavior row and shown in the admin Balasan AI page.
//
// Behavior:
// 1. Validates ?token= matches ai_behavior.wa_webhook_token
// 2. Extracts sender phone + message text from common MPWA payload shapes
// 3. Logs incoming message to wa_chat_messages (direction='in')
// 4. If wa_auto_reply + enabled => calls Lovable AI Gateway with KB context
// 5. Sends reply via existing send-whatsapp function and logs (direction='out')

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Behavior = {
  id: string;
  enabled: boolean;
  wa_auto_reply: boolean;
  wa_webhook_token: string | null;
  persona_name: string;
  system_prompt: string;
  model: string;
  temperature: number;
  max_tokens: number;
  fallback_message: string;
};

type Kb = { id: string; question: string; answer: string; category: string | null };

function pickPhone(p: Record<string, unknown>): string | null {
  // Try common payload shapes (MPWA / WAHA / Wablas / generic)
  const candidates: unknown[] = [
    p.from, p.sender, p.number, p.phone, p.wa_number,
    (p.data as Record<string, unknown> | undefined)?.from,
    (p.data as Record<string, unknown> | undefined)?.sender,
    (p.message as Record<string, unknown> | undefined)?.from,
    (p.payload as Record<string, unknown> | undefined)?.from,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.length >= 6) {
      return c.replace(/\D/g, "");
    }
  }
  return null;
}

function pickText(p: Record<string, unknown>): string | null {
  const candidates: unknown[] = [
    p.message, p.text, p.body, p.msg, p.pesan,
    (p.data as Record<string, unknown> | undefined)?.message,
    (p.data as Record<string, unknown> | undefined)?.body,
    (p.message as Record<string, unknown> | undefined)?.text,
    (p.message as Record<string, unknown> | undefined)?.body,
    ((p.message as Record<string, unknown> | undefined)?.conversation),
    (p.payload as Record<string, unknown> | undefined)?.body,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim().length > 0) return c.trim();
  }
  return null;
}

function pickName(p: Record<string, unknown>): string | null {
  const candidates: unknown[] = [
    p.pushname, p.name, p.sender_name, p.contact_name,
    (p.data as Record<string, unknown> | undefined)?.pushname,
    (p.data as Record<string, unknown> | undefined)?.name,
  ];
  for (const c of candidates) if (typeof c === "string" && c.trim()) return c.trim();
  return null;
}

async function callAI(behavior: Behavior, kb: Kb[], userMessage: string, contactName: string | null): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

  const kbText = kb
    .map((k, i) => `${i + 1}. [${k.category ?? "Umum"}] Q: ${k.question}\n   A: ${k.answer}`)
    .join("\n\n");

  const sys = `${behavior.system_prompt}\n\nNAMA PENGGUNA SAAT INI: ${contactName ?? "(tidak diketahui, sapa dengan 'Kak')"}\n\nBASIS PENGETAHUAN (gunakan HANYA info di sini, jangan mengarang):\n${kbText}\n\nJika tidak ada jawaban yang cocok, balas dengan: "${behavior.fallback_message}"`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: behavior.model || "google/gemini-2.5-flash",
      temperature: behavior.temperature ?? 0.5,
      max_tokens: behavior.max_tokens ?? 600,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: userMessage },
      ],
    }),
  });

  if (res.status === 429) return behavior.fallback_message + "\n\n_(AI sedang sibuk, coba beberapa saat lagi ya Kak 🙏)_";
  if (res.status === 402) return behavior.fallback_message;
  if (!res.ok) {
    console.error("AI gateway error", res.status, await res.text());
    return behavior.fallback_message;
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  return (typeof content === "string" && content.trim()) ? content.trim() : behavior.fallback_message;
}

async function sendWA(supabase: ReturnType<typeof createClient>, to: string, message: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("send-whatsapp", {
      body: { type: "test", to, message },
    });
    if (error) return { ok: false, error: error.message };
    const r = data as { ok?: boolean; error?: string };
    return { ok: !!r.ok, error: r.error };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    // Verify token
    const url = new URL(req.url);
    const token = url.searchParams.get("token") || req.headers.get("x-webhook-token");

    const { data: bhvRow } = await supabase
      .from("ai_behavior")
      .select("*")
      .limit(1)
      .maybeSingle();

    const behavior = bhvRow as Behavior | null;
    if (!behavior) {
      return new Response(JSON.stringify({ ok: false, error: "ai_behavior_not_configured" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }
    if (!behavior.wa_webhook_token || token !== behavior.wa_webhook_token) {
      return new Response(JSON.stringify({ ok: false, error: "invalid_token" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
    }

    // Parse payload (support JSON or form-encoded)
    let payload: Record<string, unknown> = {};
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      payload = await req.json().catch(() => ({}));
    } else if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
      const fd = await req.formData();
      fd.forEach((v, k) => { payload[k] = typeof v === "string" ? v : "(file)"; });
    } else {
      const txt = await req.text();
      try { payload = JSON.parse(txt); } catch { payload = { raw: txt }; }
    }

    const phone = pickPhone(payload);
    const text = pickText(payload);
    const contactName = pickName(payload);

    if (!phone || !text) {
      return new Response(JSON.stringify({ ok: true, ignored: "no_phone_or_text", payload }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    // Skip echo of own outgoing messages if gateway sends them
    const isFromMe = (payload as { fromMe?: boolean }).fromMe === true ||
      (payload as { is_from_me?: boolean }).is_from_me === true;
    if (isFromMe) {
      return new Response(JSON.stringify({ ok: true, ignored: "from_me" }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    // Log incoming message
    await supabase.from("wa_chat_messages").insert({
      phone, contact_name: contactName, direction: "in",
      message: text, raw: payload, status: "received",
    });

    if (!behavior.enabled || !behavior.wa_auto_reply) {
      return new Response(JSON.stringify({ ok: true, replied: false, reason: "auto_reply_off" }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    // Load enabled KB
    const { data: kbRows } = await supabase
      .from("ai_knowledge_base")
      .select("id, question, answer, category")
      .eq("enabled", true)
      .order("sort_order");
    const kb = (kbRows ?? []) as Kb[];

    // Generate AI reply
    const reply = await callAI(behavior, kb, text, contactName);

    // Send via WA
    const sendRes = await sendWA(supabase, phone, reply);

    // Log outgoing
    await supabase.from("wa_chat_messages").insert({
      phone, contact_name: contactName, direction: "out",
      message: reply, ai_used: true,
      status: sendRes.ok ? "sent" : "failed",
      raw: { send_result: sendRes },
    });

    return new Response(JSON.stringify({ ok: true, replied: true, sent: sendRes.ok }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("wa-webhook error", e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
