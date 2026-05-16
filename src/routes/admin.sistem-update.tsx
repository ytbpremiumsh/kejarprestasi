import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  RefreshCw,
  Rocket,
  Undo2,
  GitBranch,
  Copy,
  Check,
  Webhook,
  AlertTriangle,
  Loader2,
  Eye,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import {
  getSystemStatus,
  triggerUpdate,
  rollbackUpdate,
  getUpdateHistory,
  getUpdateLog,
  getWebhookConfig,
  setAutoUpdateEnabled,
  regenerateWebhookSecret,
} from "@/lib/system-update.functions";

export const Route = createFileRoute("/admin/sistem-update")({
  component: AdminSistemUpdate,
});

type Status = Awaited<ReturnType<typeof getSystemStatus>>;
type HistoryItem = Awaited<ReturnType<typeof getUpdateHistory>>["items"][number];

function AdminSistemUpdate() {
  const fnStatus = useServerFn(getSystemStatus);
  const fnTrigger = useServerFn(triggerUpdate);
  const fnRollback = useServerFn(rollbackUpdate);
  const fnHistory = useServerFn(getUpdateHistory);
  const fnLog = useServerFn(getUpdateLog);
  const fnConfig = useServerFn(getWebhookConfig);
  const fnSetEnabled = useServerFn(setAutoUpdateEnabled);
  const fnRegen = useServerFn(regenerateWebhookSecret);

  const [status, setStatus] = useState<Status | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [secret, setSecret] = useState<string>("");
  const [autoEnabled, setAutoEnabled] = useState<boolean>(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [running, setRunning] = useState<null | "update" | "rollback">(null);
  const [logModal, setLogModal] = useState<{ open: boolean; text: string; title: string }>({
    open: false,
    text: "",
    title: "",
  });
  const [copied, setCopied] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWebhookUrl(`${window.location.origin}/api/public/github-webhook`);
    }
  }, []);

  const loadAll = async (showStatusLoading = true) => {
    if (showStatusLoading) setLoadingStatus(true);
    try {
      const [s, h, c] = await Promise.all([fnStatus(), fnHistory(), fnConfig()]);
      setStatus(s);
      setHistory(h.items);
      setSecret(c.secret);
      setAutoEnabled(c.enabled);
    } catch (e: any) {
      toast.error(e?.message || "Gagal memuat data");
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    loadAll();
    const id = setInterval(() => loadAll(false), 60_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doUpdate = async () => {
    if (!confirm("Jalankan update sekarang? Aplikasi akan di-build ulang dan di-restart.")) return;
    setRunning("update");
    try {
      const r: any = await fnTrigger();
      if (r.status === "success") {
        toast.success(`Update sukses → ${r.commit}`);
      } else {
        toast.error(`Update gagal (exit ${r.code})`);
      }
      setLogModal({ open: true, text: r.log, title: "Log update terakhir" });
      await loadAll(false);
    } catch (e: any) {
      toast.error(e?.message || "Gagal menjalankan update");
    } finally {
      setRunning(null);
    }
  };

  const doRollback = async () => {
    if (!confirm("Yakin rollback ke commit sebelumnya?")) return;
    setRunning("rollback");
    try {
      const r: any = await fnRollback();
      if (r.status === "success") toast.success(`Rollback sukses → ${r.commit}`);
      else toast.error("Rollback gagal");
      setLogModal({ open: true, text: r.log, title: "Log rollback" });
      await loadAll(false);
    } catch (e: any) {
      toast.error(e?.message || "Rollback gagal");
    } finally {
      setRunning(null);
    }
  };

  const toggleAuto = async (val: boolean) => {
    setAutoEnabled(val);
    try {
      await fnSetEnabled({ data: { enabled: val } });
      toast.success(val ? "Auto-update diaktifkan" : "Auto-update dinonaktifkan");
    } catch (e: any) {
      setAutoEnabled(!val);
      toast.error(e?.message || "Gagal menyimpan");
    }
  };

  const regenSecret = async () => {
    if (!confirm("Generate ulang webhook secret? Update secret di GitHub setelahnya.")) return;
    try {
      const r: any = await fnRegen();
      setSecret(r.secret);
      toast.success("Secret baru dibuat");
    } catch (e: any) {
      toast.error(e?.message || "Gagal generate");
    }
  };

  const copy = async (val: string, key: string) => {
    try {
      await navigator.clipboard.writeText(val);
      setCopied(key);
      toast.success("Disalin");
      setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error("Gagal menyalin");
    }
  };

  const viewLog = async (item: HistoryItem) => {
    try {
      const r: any = await fnLog({ data: { id: item.id } });
      setLogModal({
        open: true,
        text: r.log || "(log kosong)",
        title: `Log ${item.commit_hash ?? ""} — ${item.trigger_source}`,
      });
    } catch (e: any) {
      toast.error(e?.message || "Gagal load log");
    }
  };

  const updateAvailable = !!status?.nodeRuntime && (status?.behind ?? 0) > 0;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Rocket className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <Badge variant="secondary" className="mb-2">Sistem</Badge>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Sistem Update</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Update aplikasi langsung dari Lovable → GitHub → domain Anda.
            </p>
          </div>
        </div>
      </div>

      {/* Runtime warning */}
      {status && !status.nodeRuntime && (
        <Card className="rounded-2xl border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex gap-3 text-sm">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-medium text-foreground">Tidak tersedia di preview Lovable</p>
              <p className="text-muted-foreground">
                Fitur ini hanya aktif ketika aplikasi di-install di server Anda
                (VPS/cPanel Node.js). Di preview ini tombol akan dinonaktifkan.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Status card */}
      <Card className="rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <GitBranch className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Versi Saat Ini</h2>
              <p className="text-xs text-muted-foreground">Status repository di server</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => loadAll(true)} disabled={loadingStatus}>
            {loadingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-2">Refresh</span>
          </Button>
        </div>

        {loadingStatus ? (
          <div className="flex h-24 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : status?.error && !status.nodeRuntime ? (
          <p className="text-sm text-muted-foreground">{status.error}</p>
        ) : status?.error ? (
          <p className="text-sm text-destructive">{status.error}</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Commit" value={status?.currentCommit ?? "-"} mono />
            <Field label="Branch" value={status?.branch ?? "-"} />
            <Field
              label="Tanggal"
              value={
                status?.currentDate
                  ? new Date(status.currentDate).toLocaleString("id-ID")
                  : "-"
              }
            />
            <div className="md:col-span-3">
              <Field label="Pesan commit" value={status?.currentMessage ?? "-"} />
            </div>
            <div className="md:col-span-3 flex flex-wrap items-center gap-3 pt-2">
              {updateAvailable ? (
                <Badge className="bg-emerald-500 text-white hover:bg-emerald-500">
                  {status?.behind} commit baru tersedia ({status?.remoteCommit})
                </Badge>
              ) : (
                <Badge variant="secondary">Sudah versi terbaru</Badge>
              )}
              <div className="flex-1" />
              <Button
                variant="outline"
                onClick={doRollback}
                disabled={!status?.nodeRuntime || running !== null}
              >
                {running === "rollback" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Undo2 className="mr-2 h-4 w-4" />
                )}
                Rollback
              </Button>
              <Button
                onClick={doUpdate}
                disabled={!status?.nodeRuntime || running !== null}
              >
                {running === "update" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Rocket className="mr-2 h-4 w-4" />
                )}
                Update Sekarang
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Webhook config */}
      <Card className="rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <Webhook className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Auto-Update via GitHub Webhook</h2>
              <p className="text-xs text-muted-foreground">
                Setiap kali Lovable push ke GitHub, domain ikut ter-update otomatis.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-toggle" className="text-sm">Aktif</Label>
            <Switch id="auto-toggle" checked={autoEnabled} onCheckedChange={toggleAuto} />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Webhook URL (paste ke GitHub → Settings → Webhooks → Payload URL)
            </Label>
            <div className="mt-1 flex gap-2">
              <Input value={webhookUrl} readOnly className="font-mono text-xs" />
              <Button variant="outline" size="icon" onClick={() => copy(webhookUrl, "url")}>
                {copied === "url" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Secret (paste ke GitHub → Settings → Webhooks → Secret)
            </Label>
            <div className="mt-1 flex gap-2">
              <Input value={secret} readOnly className="font-mono text-xs" />
              <Button variant="outline" size="icon" onClick={() => copy(secret, "secret")}>
                {copied === "secret" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="icon" onClick={regenSecret} title="Generate ulang">
                <KeyRound className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
            <p className="mb-1 font-medium text-foreground">Cara setup di GitHub:</p>
            <ol className="list-decimal space-y-0.5 pl-5">
              <li>Buka repo Anda → <strong>Settings</strong> → <strong>Webhooks</strong> → <strong>Add webhook</strong></li>
              <li>Payload URL: copy dari atas</li>
              <li>Content type: <code className="rounded bg-background px-1">application/json</code></li>
              <li>Secret: copy dari atas</li>
              <li>Event: pilih <strong>Just the push event</strong></li>
              <li>Active: ✅ centang, lalu <strong>Add webhook</strong></li>
              <li>Aktifkan toggle "Aktif" di kanan atas card ini</li>
            </ol>
          </div>
        </div>
      </Card>

      {/* History */}
      <Card className="rounded-2xl p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
            <RefreshCw className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Riwayat Update</h2>
            <p className="text-xs text-muted-foreground">20 update terakhir</p>
          </div>
        </div>

        {history.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Belum ada riwayat update.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Commit</TableHead>
                  <TableHead>Sumber</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Durasi</TableHead>
                  <TableHead className="text-right">Log</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="text-xs">
                      {new Date(h.created_at).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {h.commit_hash ?? "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {h.trigger_source}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={h.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {h.duration_ms ? `${(h.duration_ms / 1000).toFixed(1)}s` : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => viewLog(h)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Log modal */}
      <Dialog open={logModal.open} onOpenChange={(o) => setLogModal((m) => ({ ...m, open: o }))}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{logModal.title}</DialogTitle>
          </DialogHeader>
          <Textarea
            readOnly
            value={logModal.text}
            className="h-[60vh] resize-none font-mono text-xs"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 text-sm text-foreground ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "success") return <Badge className="bg-emerald-500 text-white hover:bg-emerald-500">Sukses</Badge>;
  if (status === "failed") return <Badge variant="destructive">Gagal</Badge>;
  return <Badge variant="secondary">Berjalan…</Badge>;
}
