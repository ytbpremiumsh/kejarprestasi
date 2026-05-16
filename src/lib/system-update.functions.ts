import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const APP_DIR = process.env.APP_DIR || process.cwd();

async function assertAdmin(
  supabase: any,
  userId: string,
): Promise<void> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) {
    throw new Response("Forbidden: admin only", { status: 403 });
  }
}

let _nodeRuntimeCache: boolean | null = null;
async function isNodeRuntime(): Promise<boolean> {
  if (_nodeRuntimeCache !== null) return _nodeRuntimeCache;
  try {
    const cp: any = await import("node:child_process");
    if (typeof cp.spawn !== "function") {
      _nodeRuntimeCache = false;
      return false;
    }
    // Probe: Cloudflare unenv stub throws "[unenv] ... not implemented yet!"
    await new Promise<void>((resolve, reject) => {
      try {
        const child = cp.spawn("node", ["-v"]);
        child.on("error", (e: Error) => reject(e));
        child.on("close", () => resolve());
      } catch (e) {
        reject(e as Error);
      }
    });
    _nodeRuntimeCache = true;
  } catch {
    _nodeRuntimeCache = false;
  }
  return _nodeRuntimeCache;
}

async function runCmd(
  cmd: string,
  args: string[],
  cwd: string,
  timeoutMs = 5 * 60 * 1000,
): Promise<{ stdout: string; stderr: string; code: number }> {
  const { spawn } = await import("node:child_process");
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd, env: process.env });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      try {
        child.kill("SIGKILL");
      } catch {}
    }, timeoutMs);
    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ stdout, stderr, code: code ?? -1 });
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      stderr += `\n${err.message}`;
      resolve({ stdout, stderr, code: -1 });
    });
  });
}

async function gitOutput(args: string[]): Promise<string> {
  const r = await runCmd("git", args, APP_DIR, 30_000);
  return r.stdout.trim();
}

// ─── Status ────────────────────────────────────────────────────────────────

export const getSystemStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);

    if (!isNodeRuntime()) {
      return {
        nodeRuntime: false,
        appDir: APP_DIR,
        currentCommit: null,
        currentMessage: null,
        currentDate: null,
        branch: null,
        remoteCommit: null,
        behind: 0,
        error:
          "Fitur ini hanya berfungsi di self-hosted Node.js (VPS/cPanel). Di Lovable preview (Cloudflare Worker) tidak tersedia.",
      } as const;
    }

    try {
      const [hash, msg, date, branch] = await Promise.all([
        gitOutput(["rev-parse", "--short", "HEAD"]),
        gitOutput(["log", "-1", "--pretty=%s"]),
        gitOutput(["log", "-1", "--pretty=%cI"]),
        gitOutput(["rev-parse", "--abbrev-ref", "HEAD"]),
      ]);

      // fetch silent
      await runCmd("git", ["fetch", "--quiet", "origin", branch || "main"], APP_DIR, 30_000);
      const remoteHash = await gitOutput(["rev-parse", "--short", `origin/${branch || "main"}`]);
      const behindStr = await gitOutput([
        "rev-list",
        "--count",
        `HEAD..origin/${branch || "main"}`,
      ]);

      return {
        nodeRuntime: true,
        appDir: APP_DIR,
        currentCommit: hash || null,
        currentMessage: msg || null,
        currentDate: date || null,
        branch: branch || "main",
        remoteCommit: remoteHash || null,
        behind: Number.parseInt(behindStr || "0", 10) || 0,
        error: null as string | null,
      };
    } catch (e: any) {
      return {
        nodeRuntime: true,
        appDir: APP_DIR,
        currentCommit: null,
        currentMessage: null,
        currentDate: null,
        branch: null,
        remoteCommit: null,
        behind: 0,
        error: `Gagal baca git: ${e?.message ?? String(e)}`,
      };
    }
  });

// ─── Trigger update ────────────────────────────────────────────────────────

export const triggerUpdate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);

    if (!isNodeRuntime()) {
      throw new Response(
        "Update hanya berfungsi di self-hosted Node.js (VPS/cPanel).",
        { status: 400 },
      );
    }

    const started = Date.now();
    const beforeHash = await gitOutput(["rev-parse", "HEAD"]).catch(() => "");

    const { data: row } = await supabaseAdmin
      .from("system_updates")
      .insert({
        commit_hash: beforeHash.slice(0, 7) || null,
        trigger_source: "manual",
        status: "running",
        triggered_by: context.userId,
      })
      .select("id")
      .single();

    const updateId = row?.id as string | undefined;

    const script = `${APP_DIR}/update.sh`;
    const r = await runCmd("bash", [script], APP_DIR, 10 * 60 * 1000);
    const log = (r.stdout + "\n" + r.stderr).slice(-20000);
    const afterHash = await gitOutput(["rev-parse", "--short", "HEAD"]).catch(() => "");
    const afterMsg = await gitOutput(["log", "-1", "--pretty=%s"]).catch(() => "");

    const status = r.code === 0 ? "success" : "failed";

    if (updateId) {
      await supabaseAdmin
        .from("system_updates")
        .update({
          status,
          log_output: log,
          duration_ms: Date.now() - started,
          commit_hash: afterHash || null,
          commit_message: afterMsg || null,
        })
        .eq("id", updateId);
    }

    return {
      status,
      code: r.code,
      durationMs: Date.now() - started,
      commit: afterHash,
      message: afterMsg,
      log,
    };
  });

// ─── Rollback ──────────────────────────────────────────────────────────────

export const rollbackUpdate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);

    if (!isNodeRuntime()) {
      throw new Response("Rollback hanya tersedia di self-hosted Node.js.", {
        status: 400,
      });
    }

    const started = Date.now();
    const prevHash = await gitOutput(["rev-parse", "HEAD~1"]).catch(() => "");
    if (!prevHash) {
      throw new Response("Tidak ada commit sebelumnya untuk di-rollback.", {
        status: 400,
      });
    }

    const { data: row } = await supabaseAdmin
      .from("system_updates")
      .insert({
        commit_hash: prevHash.slice(0, 7),
        trigger_source: "rollback",
        status: "running",
        triggered_by: context.userId,
      })
      .select("id")
      .single();
    const updateId = row?.id as string | undefined;

    const reset = await runCmd("git", ["reset", "--hard", prevHash], APP_DIR, 30_000);
    let log = reset.stdout + reset.stderr;
    let code = reset.code;

    if (code === 0) {
      const install = await runCmd("bash", ["-lc", "npm install --no-audit --no-fund"], APP_DIR, 5 * 60 * 1000);
      log += "\n" + install.stdout + install.stderr;
      code = install.code;
    }
    if (code === 0) {
      const build = await runCmd("bash", ["-lc", "npm run build"], APP_DIR, 10 * 60 * 1000);
      log += "\n" + build.stdout + build.stderr;
      code = build.code;
    }
    if (code === 0) {
      const restart = await runCmd("bash", ["-lc", "pm2 restart all --update-env || sudo systemctl restart kejar-prestasi || true"], APP_DIR, 60_000);
      log += "\n" + restart.stdout + restart.stderr;
    }

    const status = code === 0 ? "success" : "failed";
    const afterMsg = await gitOutput(["log", "-1", "--pretty=%s"]).catch(() => "");

    if (updateId) {
      await supabaseAdmin
        .from("system_updates")
        .update({
          status,
          log_output: log.slice(-20000),
          duration_ms: Date.now() - started,
          commit_message: afterMsg || null,
        })
        .eq("id", updateId);
    }

    return { status, commit: prevHash.slice(0, 7), message: afterMsg, log: log.slice(-20000) };
  });

// ─── History ───────────────────────────────────────────────────────────────

export const getUpdateHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);

    const { data, error } = await context.supabase
      .from("system_updates")
      .select("id, commit_hash, commit_message, branch, trigger_source, status, duration_ms, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw new Response(error.message, { status: 500 });
    return { items: data ?? [] };
  });

export const getUpdateLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("system_updates")
      .select("log_output")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Response(error.message, { status: 500 });
    return { log: row?.log_output ?? "" };
  });

// ─── Webhook config ────────────────────────────────────────────────────────

function generateSecret(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export const getWebhookConfig = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);

    const [{ data: secretRow }, { data: enabledRow }] = await Promise.all([
      supabaseAdmin.from("site_settings").select("value").eq("key", "github_webhook_secret").maybeSingle(),
      supabaseAdmin.from("site_settings").select("value").eq("key", "auto_update_enabled").maybeSingle(),
    ]);

    let secret = (secretRow?.value as any)?.secret as string | undefined;
    if (!secret) {
      secret = generateSecret();
      await supabaseAdmin.from("site_settings").upsert({
        key: "github_webhook_secret",
        value: { secret } as any,
      });
    }

    const enabled = Boolean((enabledRow?.value as any)?.enabled);

    return { secret, enabled };
  });

export const setAutoUpdateEnabled = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ enabled: z.boolean() }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    await supabaseAdmin.from("site_settings").upsert({
      key: "auto_update_enabled",
      value: { enabled: data.enabled } as any,
    });
    return { ok: true };
  });

export const regenerateWebhookSecret = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const secret = generateSecret();
    await supabaseAdmin.from("site_settings").upsert({
      key: "github_webhook_secret",
      value: { secret } as any,
    });
    return { secret };
  });
