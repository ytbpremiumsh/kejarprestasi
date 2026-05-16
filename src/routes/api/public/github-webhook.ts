import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const APP_DIR = process.env.APP_DIR || process.cwd();

function isNodeRuntime(): boolean {
  return (
    typeof process !== "undefined" &&
    !!(process as any).versions?.node &&
    typeof (process as any).platform === "string"
  );
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmacSha256Hex(secret: string, body: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(body));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function runUpdate(triggeredHash: string | null, commitMessage: string | null) {
  const { spawn } = await import("node:child_process");
  const { data: row } = await supabaseAdmin
    .from("system_updates")
    .insert({
      commit_hash: triggeredHash ? triggeredHash.slice(0, 7) : null,
      commit_message: commitMessage,
      trigger_source: "webhook",
      status: "running",
    })
    .select("id")
    .single();
  const updateId = row?.id as string | undefined;

  const started = Date.now();
  const script = `${APP_DIR}/update.sh`;
  const child = spawn("bash", [script], { cwd: APP_DIR, env: process.env });
  let log = "";
  child.stdout.on("data", (d) => (log += d.toString()));
  child.stderr.on("data", (d) => (log += d.toString()));
  child.on("close", async (code) => {
    if (!updateId) return;
    await supabaseAdmin
      .from("system_updates")
      .update({
        status: code === 0 ? "success" : "failed",
        log_output: log.slice(-20000),
        duration_ms: Date.now() - started,
      })
      .eq("id", updateId);
  });
}

export const Route = createFileRoute("/api/public/github-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const event = request.headers.get("x-github-event") || "";
        const signature = request.headers.get("x-hub-signature-256") || "";
        const body = await request.text();

        // Load secret + enabled flag
        const [{ data: secretRow }, { data: enabledRow }] = await Promise.all([
          supabaseAdmin
            .from("site_settings")
            .select("value")
            .eq("key", "github_webhook_secret")
            .maybeSingle(),
          supabaseAdmin
            .from("site_settings")
            .select("value")
            .eq("key", "auto_update_enabled")
            .maybeSingle(),
        ]);

        const secret = (secretRow?.value as any)?.secret as string | undefined;
        if (!secret) {
          return new Response("Webhook secret not configured", { status: 503 });
        }

        const expected = "sha256=" + (await hmacSha256Hex(secret, body));
        if (!signature || !timingSafeEqualStr(signature, expected)) {
          return new Response("Invalid signature", { status: 401 });
        }

        if (event === "ping") {
          return new Response(JSON.stringify({ ok: true, pong: true }), {
            headers: { "Content-Type": "application/json" },
          });
        }

        if (event !== "push") {
          return new Response(JSON.stringify({ ok: true, ignored: event }), {
            headers: { "Content-Type": "application/json" },
          });
        }

        let payload: any = {};
        try {
          payload = JSON.parse(body);
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const ref = payload.ref as string | undefined;
        if (!ref || (!ref.endsWith("/main") && !ref.endsWith("/master"))) {
          return new Response(JSON.stringify({ ok: true, skipped: ref }), {
            headers: { "Content-Type": "application/json" },
          });
        }

        const enabled = Boolean((enabledRow?.value as any)?.enabled);
        if (!enabled) {
          return new Response(JSON.stringify({ ok: true, autoUpdate: false }), {
            headers: { "Content-Type": "application/json" },
          });
        }

        if (!isNodeRuntime()) {
          return new Response(
            JSON.stringify({
              ok: false,
              error: "Self-hosted Node.js required",
            }),
            { status: 501, headers: { "Content-Type": "application/json" } },
          );
        }

        const headCommit = payload.after as string | undefined;
        const headMessage = payload.head_commit?.message as string | undefined;

        // fire & forget
        runUpdate(headCommit ?? null, headMessage ?? null).catch((e) =>
          console.error("[github-webhook] update failed", e),
        );

        return new Response(JSON.stringify({ ok: true, triggered: true }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
