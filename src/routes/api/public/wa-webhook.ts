import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Webhook-Token, X-Requested-With, Accept, Origin",
  "Access-Control-Max-Age": "86400",
};

type AnyRecord = Record<string, unknown>;
type Db = { from: (table: string) => any };

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

type Provider = {
  vendor?: "lovable_ai" | "openrouter";
  api_key?: string | null;
  base_url?: string | null;
  model?: string | null;
  enabled?: boolean;
};

type Kb = { id: string; question: string; answer: string; category: string | null };

export const Route = createFileRoute("/api/public/wa-webhook")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      GET: async ({ request }) => handleGet(request),
      POST: async ({ request }) => handleWebhook(request),
    },
  },
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleGet(request: Request) {
  const url = new URL(request.url);
  const hasMessagePayload = ["from", "sender", "number", "phone", "wa_number", "remoteJid", "message", "text", "body", "msg", "pesan"].some((key) => url.searchParams.has(key));
  if (hasMessagePayload) return handleWebhook(request);
  return json({ ok: true, endpoint: "wa-webhook", method: "POST/GET" });
}

async function handleWebhook(request: Request) {
  const db = supabaseAdmin as unknown as Db;

  try {
    const behavior = await loadBehavior(db);
    if (!behavior) return json({ ok: false, error: "ai_behavior_not_configured" }, 400);

    const payload = await parsePayload(request);
    const url = new URL(request.url);
    const bearer = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
    const token = url.searchParams.get("token") || request.headers.get("x-webhook-token") || bearer || firstString(payload, ["token", "webhook_token", "secret", "data.token", "payload.token"]);
    if (!behavior.wa_webhook_token || token !== behavior.wa_webhook_token) {
      return json({ ok: false, error: "invalid_token" }, 401);
    }

    const rawPhone = pickRawPhone(payload);
    const phone = normalizeNumber(rawPhone ?? "");
    const text = pickText(payload);
    const contactName = pickName(payload);

    if (isFromMe(payload)) return json({ ok: true, ignored: "from_me" });
    if (isGroupMessage(payload, rawPhone)) return json({ ok: true, ignored: "group_message" });
    if (!phone || !text) {
      await db.from("wa_chat_messages").insert({
        phone: phone || "unknown",
        contact_name: contactName,
        direction: "in",
        message: text || "[Webhook diterima, tetapi nomor atau isi pesan belum terbaca]",
        raw: payload,
        status: "ignored_no_phone_or_text",
      });
      return json({ ok: true, ignored: "no_phone_or_text", parsed: { phone, text }, payload });
    }

    await db.from("wa_chat_messages").insert({
      phone,
      contact_name: contactName,
      direction: "in",
      message: text,
      raw: payload,
      status: truthy(payload.dry_run) ? "received_test" : "received",
    });

    if (truthy(payload.dry_run)) {
      return json({ ok: true, received: true, dry_run: true, parsed: { phone, text, contactName } });
    }

    if (!behavior.enabled || !behavior.wa_auto_reply) {
      return json({ ok: true, replied: false, reason: "auto_reply_off" });
    }

    const [{ data: kbRows }, provider] = await Promise.all([
      db.from("ai_knowledge_base").select("id, question, answer, category").eq("enabled", true).order("sort_order"),
      loadProvider(db),
    ]);

    const reply = await callAI(behavior, provider, (kbRows ?? []) as Kb[], text, contactName);
    const sendRes = await sendWA(db, phone, reply);

    await db.from("wa_chat_messages").insert({
      phone,
      contact_name: contactName,
      direction: "out",
      message: reply,
      ai_used: true,
      status: sendRes.ok ? "sent" : "failed",
      raw: { send_result: sendRes },
    });

    return json({ ok: true, replied: true, sent: sendRes.ok, send_error: sendRes.error });
  } catch (error) {
    console.error("wa-webhook route error", error);
    return json({ ok: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
}

async function loadBehavior(db: Db): Promise<Behavior | null> {
  const { data } = await db.from("ai_behavior").select("*").limit(1).maybeSingle();
  return (data ?? null) as Behavior | null;
}

async function loadProvider(db: Db): Promise<Provider | null> {
  const { data } = await db.from("ai_provider_settings").select("*").eq("enabled", true).limit(1).maybeSingle();
  return (data ?? null) as Provider | null;
}

async function parsePayload(request: Request): Promise<AnyRecord> {
  const url = new URL(request.url);
  const queryPayload = Object.fromEntries(url.searchParams.entries()) as AnyRecord;
  const ct = request.headers.get("content-type") || "";
  if (request.method === "GET" || request.method === "HEAD") return queryPayload;
  if (ct.includes("application/json")) return { ...queryPayload, ...(((await request.json().catch(() => ({}))) ?? {}) as AnyRecord) };
  if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
    const form = await request.formData();
    const payload: AnyRecord = { ...queryPayload };
    form.forEach((value, key) => {
      payload[key] = typeof value === "string" ? value : "(file)";
    });
    return payload;
  }
  const text = await request.text();
  if (!text.trim()) return queryPayload;
  try {
    return { ...queryPayload, ...(JSON.parse(text) as AnyRecord) };
  } catch {
    return { ...queryPayload, raw: text };
  }
}

function getPath(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (current == null) return undefined;
    if (Array.isArray(current)) return current[Number(key)];
    if (typeof current === "object") return (current as AnyRecord)[key];
    return undefined;
  }, source);
}

function firstString(payload: AnyRecord, paths: string[]): string | null {
  for (const path of paths) {
    const value = getPath(payload, path);
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function pickRawPhone(payload: AnyRecord): string | null {
  return firstString(payload, [
    "from", "sender", "number", "phone", "wa_number", "remoteJid", "jid", "chatId", "participant", "author",
    "data.from", "data.sender", "data.number", "data.phone", "data.remoteJid", "data.chatId", "data.jid", "data.participant", "data.author", "data.key.remoteJid", "data.key.participant",
    "message.from", "message.sender", "message.key.remoteJid", "message.key.participant", "payload.from", "payload.sender", "payload.phone", "payload.number",
    "entry.0.changes.0.value.messages.0.from",
    "messages.0.from", "messages.0.sender", "messages.0.key.remoteJid", "messages.0.remoteJid",
  ]);
}

function pickText(payload: AnyRecord): string | null {
  return firstString(payload, [
    "text", "body", "msg", "pesan", "caption", "message", "conversation", "content",
    "data.text", "data.body", "data.message", "data.msg", "data.caption", "data.content", "data.message.conversation",
    "data.message.extendedTextMessage.text", "data.message.imageMessage.caption", "data.message.videoMessage.caption",
    "message.text", "message.body", "message.conversation", "message.extendedTextMessage.text", "message.imageMessage.caption", "message.videoMessage.caption",
    "payload.text", "payload.body", "payload.message", "payload.caption",
    "entry.0.changes.0.value.messages.0.text.body",
    "messages.0.text", "messages.0.body", "messages.0.message.conversation", "messages.0.message.extendedTextMessage.text",
  ]);
}

function pickName(payload: AnyRecord): string | null {
  return firstString(payload, [
    "pushname", "pushName", "name", "sender_name", "contact_name",
    "data.pushname", "data.pushName", "data.name", "data.sender_name",
    "message.pushName", "messages.0.pushName", "messages.0.pushname",
  ]);
}

function normalizeNumber(raw: string): string {
  const withoutJid = raw.split("@")[0];
  const match = withoutJid.match(/(?:62|0|8)\d{7,15}/);
  let number = (match?.[0] ?? withoutJid).replace(/\D/g, "");
  if (number.startsWith("0")) number = `62${number.slice(1)}`;
  if (number.startsWith("8")) number = `62${number}`;
  return number;
}

function truthy(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || String(value).toLowerCase() === "true";
}

function isFromMe(payload: AnyRecord): boolean {
  return ["fromMe", "is_from_me", "data.fromMe", "data.key.fromMe", "message.fromMe", "messages.0.key.fromMe"].some((path) => truthy(getPath(payload, path)));
}

function isGroupMessage(payload: AnyRecord, rawPhone: string | null): boolean {
  return truthy(payload.isGroup) || truthy(getPath(payload, "data.isGroup")) || (rawPhone?.includes("@g.us") ?? false);
}

function buildSystemPrompt(behavior: Behavior, kb: Kb[], contactName: string | null): string {
  const kbText = kb.map((k, i) => `${i + 1}. [${k.category ?? "Umum"}] Q: ${k.question}\nA: ${k.answer}`).join("\n\n");
  return `${behavior.system_prompt}\n\nNAMA PENGGUNA SAAT INI: ${contactName ?? "(tidak diketahui, sapa dengan 'Kak')"}\n\nBASIS PENGETAHUAN (gunakan HANYA info di sini, jangan mengarang):\n${kbText}\n\nAturan balasan: gunakan panggilan Kak/Kakak, boleh menyebut nama peserta jika tersedia, jawab ringkas dan jelas. Jika tidak ada jawaban yang cocok, balas dengan: "${behavior.fallback_message}"`;
}

async function callAI(behavior: Behavior, provider: Provider | null, kb: Kb[], userMessage: string, contactName: string | null): Promise<string> {
  const systemPrompt = buildSystemPrompt(behavior, kb, contactName);
  const vendor = provider?.enabled === false ? "lovable_ai" : provider?.vendor ?? "lovable_ai";
  const model = provider?.model?.trim() || behavior.model || "google/gemini-3-flash-preview";
  const endpoint = vendor === "openrouter" ? (provider?.base_url?.trim() || "https://openrouter.ai/api/v1/chat/completions") : "https://ai.gateway.lovable.dev/v1/chat/completions";
  const apiKey = vendor === "openrouter" ? (provider?.api_key?.trim() || process.env.OPENROUTER_API_KEY) : process.env.LOVABLE_API_KEY;

  if (!apiKey) return behavior.fallback_message;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(vendor === "openrouter" ? { "HTTP-Referer": "https://prestasi-emas.lovable.app", "X-Title": "Kejar Prestasi AI" } : {}),
    },
    body: JSON.stringify({
      model,
      temperature: behavior.temperature ?? 0.5,
      max_tokens: behavior.max_tokens ?? 600,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    }),
  });

  if (response.status === 429) return `${behavior.fallback_message}\n\n_(AI sedang sibuk, coba beberapa saat lagi ya Kak 🙏)_`;
  if (response.status === 402) return behavior.fallback_message;
  if (!response.ok) {
    console.error("AI provider error", response.status, await response.text());
    return behavior.fallback_message;
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  return typeof content === "string" && content.trim() ? content.trim() : behavior.fallback_message;
}

async function sendWA(db: Db, to: string, message: string): Promise<{ ok: boolean; error?: string; response?: unknown }> {
  const { data: row } = await db.from("site_settings").select("value").eq("key", "whatsapp").maybeSingle();
  const cfg = (row?.value ?? {}) as { enabled?: boolean; api_key?: string; device?: string; send_endpoint?: string };
  if (!cfg.enabled) return { ok: false, error: "wa_disabled" };
  if (!cfg.api_key || !cfg.device) return { ok: false, error: "missing_config" };

  const response = await fetch(cfg.send_endpoint || "https://app.ayopintar.com/send-message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: cfg.api_key, sender: cfg.device, number: normalizeNumber(to), message }),
  });
  let body: unknown = null;
  try { body = await response.json(); } catch { body = await response.text().catch(() => null); }
  return { ok: response.ok, error: response.ok ? undefined : `wa_gateway_${response.status}`, response: body };
}