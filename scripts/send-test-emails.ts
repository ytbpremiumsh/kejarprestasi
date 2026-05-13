import * as React from "react";
import { render } from "@react-email/components";
import { createClient } from "@supabase/supabase-js";
import { template as registrationConfirmation } from "../src/lib/email-templates/registration-confirmation";
import { template as berkasConfirmation } from "../src/lib/email-templates/berkas-confirmation";

const RECIPIENT = "rizkyarif92@gmail.com";
const SENDER_DOMAIN = "notify.kejarprestasi.id";
const FROM_EMAIL = "Prestasi Kita <noreply@notify.kejarprestasi.id>";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function sendOne(name: string, entry: any, props: any) {
  const html = await render(React.createElement(entry.component, props));
  const text = await render(React.createElement(entry.component, props), { plainText: true });
  const subject = typeof entry.subject === "function" ? entry.subject(props) : entry.subject;
  const messageId = crypto.randomUUID();
  const { data, error } = await supabase.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      to: RECIPIENT,
      from: FROM_EMAIL,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text,
      purpose: "transactional",
      label: name,
      idempotency_key: `test-${name}-${Date.now()}`,
      message_id: messageId,
    },
  });
  console.log(name, { data, error, messageId, subject });
}

await sendOne("registration-confirmation", registrationConfirmation, {
  fullName: "Rizky Arif",
  kind: "prestasi",
  token: "KP-PRE-TEST02",
});
await sendOne("berkas-confirmation", berkasConfirmation, {
  fullName: "Rizky Arif",
  kind: "prestasi",
  token: "KP-PRE-TEST02",
});
