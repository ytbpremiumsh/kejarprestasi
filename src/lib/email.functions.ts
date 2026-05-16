import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import * as React from "react";
import { render } from "@react-email/components";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { TEMPLATES } from "./email-templates/registry";

const SENDER_DOMAIN = "notify.mail.kejarprestasi.id";
const FROM_EMAIL = "Kejar Prestasi <noreply@notify.mail.kejarprestasi.id>";

const CUSTOMIZABLE: Record<string, string> = {
  "registration-confirmation": "email_template_registration",
  "berkas-confirmation": "email_template_berkas",
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function kindLabel(k?: string) {
  return k === "prestasi"
    ? "Beasiswa Prestasi"
    : k === "ekonomi"
      ? "Beasiswa Ekonomi"
      : "Beasiswa";
}

function buildPlaceholders(props: Record<string, any>) {
  return {
    full_name: String(props.fullName ?? props.full_name ?? ""),
    token: String(props.token ?? ""),
    kind: String(props.kind ?? ""),
    kind_label: kindLabel(props.kind),
    whatsapp: String(props.whatsapp ?? ""),
    count: String(props.count ?? ""),
    year: String(new Date().getFullYear()),
    site_name: "Kejar Prestasi",
  };
}

function applyPlaceholders(tpl: string, props: Record<string, any>) {
  const values = buildPlaceholders(props);
  return tpl.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
    const v = values[key as keyof typeof values];
    return v == null ? "" : escapeHtml(v);
  });
}

function htmlToText(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function loadCustomTemplate(templateName: string) {
  const key = CUSTOMIZABLE[templateName];
  if (!key) return null;
  const { data } = await (supabaseAdmin as any)
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  const v = data?.value as { enabled?: boolean; subject?: string; html?: string } | null;
  if (!v || !v.enabled || !v.html || !v.subject) return null;
  return { subject: v.subject, html: v.html };
}

function generateUnsubscribeToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function getOrCreateUnsubscribeToken(email: string) {
  const normalizedEmail = email.toLowerCase();
  const { data: existing, error: lookupError } = await (supabaseAdmin as any)
    .from("email_unsubscribe_tokens")
    .select("token, used_at")
    .eq("email", normalizedEmail)
    .maybeSingle();
  if (lookupError) throw new Error("Failed to prepare unsubscribe token");
  if (existing?.token && !existing.used_at) return existing.token as string;

  const token = generateUnsubscribeToken();
  const { error: upsertError } = await (supabaseAdmin as any)
    .from("email_unsubscribe_tokens")
    .upsert({ token, email: normalizedEmail }, { onConflict: "email", ignoreDuplicates: true });
  if (upsertError) throw new Error("Failed to create unsubscribe token");

  const { data: stored, error: rereadError } = await (supabaseAdmin as any)
    .from("email_unsubscribe_tokens")
    .select("token")
    .eq("email", normalizedEmail)
    .maybeSingle();
  if (rereadError || !stored?.token) throw new Error("Failed to confirm unsubscribe token");
  return stored.token as string;
}

async function loadBrandingLogo(): Promise<string | undefined> {
  const { data } = await (supabaseAdmin as any)
    .from("site_settings")
    .select("value")
    .eq("key", "branding")
    .maybeSingle();
  const v = data?.value as { header_logo_url?: string; footer_logo_url?: string } | null;
  return v?.header_logo_url || v?.footer_logo_url || undefined;
}

async function renderEmail(templateName: string, props: Record<string, any>) {
  const logoUrl = await loadBrandingLogo();
  const propsWithLogo = { ...props, logoUrl };
  const custom = await loadCustomTemplate(templateName);
  if (custom) {
    const html = applyPlaceholders(custom.html, props);
    const subject = applyPlaceholders(custom.subject, props);
    const text = htmlToText(html);
    return { html, subject, text };
  }
  const entry = TEMPLATES[templateName];
  if (!entry) throw new Error(`Unknown template: ${templateName}`);
  const html = await render(React.createElement(entry.component, props));
  const text = await render(React.createElement(entry.component, props), {
    plainText: true,
  });
  const subject =
    typeof entry.subject === "function" ? entry.subject(props) : entry.subject;
  return { html, subject, text };
}

async function enqueue(args: {
  recipient: string;
  templateName: string;
  idempotencyKey: string;
  subject: string;
  html: string;
  text: string;
}) {
  const messageId = crypto.randomUUID();
  const unsubscribeToken = await getOrCreateUnsubscribeToken(args.recipient);
  const { error } = await (supabaseAdmin as any).rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      to: args.recipient,
      from: FROM_EMAIL,
      sender_domain: SENDER_DOMAIN,
      subject: args.subject,
      html: args.html,
      text: args.text,
      purpose: "transactional",
      label: args.templateName,
      idempotency_key: args.idempotencyKey,
      unsubscribe_token: unsubscribeToken,
      message_id: messageId,
      queued_at: new Date().toISOString(),
    },
  });
  if (error) throw new Error(error.message);
  return messageId;
}

export const sendAppEmail = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        templateName: z.string().min(1).max(100),
        recipientEmail: z.string().email(),
        idempotencyKey: z.string().min(1).max(200),
        templateData: z.record(z.string(), z.any()).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const recipient = data.recipientEmail.toLowerCase();
    const props = data.templateData ?? {};

    const { data: suppressed } = await (supabaseAdmin as any)
      .from("suppressed_emails")
      .select("email")
      .eq("email", recipient)
      .maybeSingle();
    if (suppressed) return { ok: true, skipped: "suppressed" as const };

    const { html, subject, text } = await renderEmail(data.templateName, props);
    const messageId = await enqueue({
      recipient,
      templateName: data.templateName,
      idempotencyKey: data.idempotencyKey,
      subject,
      html,
      text,
    });
    return { ok: true, messageId };
  });

export const sendTestEmail = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        templateName: z.enum(["registration-confirmation", "berkas-confirmation"]),
        recipientEmail: z.string().email(),
        subject: z.string().min(1).max(300),
        html: z.string().min(1).max(200000),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const recipient = data.recipientEmail.toLowerCase();
    const sampleProps: Record<string, any> = {
      fullName: "Andi Pratama",
      token: data.templateName === "berkas-confirmation" ? "KP-PRE-A1B2C3" : "KP-PRE-A1B2C3",
      kind: "prestasi",
      whatsapp: "08123456789",
      count: 5,
    };
    const html = applyPlaceholders(data.html, sampleProps);
    const subject = applyPlaceholders(data.subject, sampleProps);
    const text = htmlToText(html);
    const messageId = await enqueue({
      recipient,
      templateName: `${data.templateName}-test`,
      idempotencyKey: `test-${data.templateName}-${Date.now()}`,
      subject: `[TEST] ${subject}`,
      html,
      text,
    });
    return { ok: true, messageId };
  });
