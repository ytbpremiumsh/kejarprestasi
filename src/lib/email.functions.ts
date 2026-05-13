import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import * as React from "react";
import { render } from "@react-email/components";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { TEMPLATES } from "./email-templates/registry";

const SENDER_DOMAIN = "notify.kejarprestasi.id";
const FROM_EMAIL = "Kejar Prestasi <noreply@notify.kejarprestasi.id>";

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
    const entry = TEMPLATES[data.templateName];
    if (!entry) throw new Error(`Unknown template: ${data.templateName}`);

    const recipient = (entry.to ?? data.recipientEmail).toLowerCase();
    const props = data.templateData ?? {};

    // Skip suppressed addresses
    const { data: suppressed } = await (supabaseAdmin as any)
      .from("suppressed_emails")
      .select("email")
      .eq("email", recipient)
      .maybeSingle();
    if (suppressed) return { ok: true, skipped: "suppressed" as const };

    const html = await render(React.createElement(entry.component, props));
    const text = await render(React.createElement(entry.component, props), {
      plainText: true,
    });
    const subject =
      typeof entry.subject === "function" ? entry.subject(props) : entry.subject;

    const messageId = crypto.randomUUID();

    const { error } = await (supabaseAdmin as any).rpc("enqueue_email", {
      queue_name: "transactional_emails",
      payload: {
        to: recipient,
        from: FROM_EMAIL,
        sender_domain: SENDER_DOMAIN,
        subject,
        html,
        text,
        purpose: "transactional",
        label: data.templateName,
        idempotency_key: data.idempotencyKey,
        message_id: messageId,
      },
    });
    if (error) throw new Error(error.message);

    return { ok: true, messageId };
  });
