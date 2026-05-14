import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, ShieldCheck, ShieldAlert, KeyRound, Smartphone, Copy } from "lucide-react";

export const Route = createFileRoute("/admin/keamanan")({
  head: () => ({ meta: [{ title: "Keamanan Akun — Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: KeamananPage,
});

type FactorRow = { id: string; status: "verified" | "unverified"; friendly_name?: string | null };

function KeamananPage() {
  const [loading, setLoading] = useState(true);
  const [factors, setFactors] = useState<FactorRow[]>([]);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollFactorId, setEnrollFactorId] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      toast.error(error.message);
    } else {
      setFactors(data.totp as FactorRow[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const verified = factors.find((f) => f.status === "verified");
  const enabled = !!verified;

  const startEnroll = async () => {
    setBusy(true);
    try {
      // Bersihkan factor unverified yang lama
      for (const f of factors.filter((x) => x.status === "unverified")) {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: `Authenticator ${new Date().toISOString().slice(0, 10)}`,
      });
      if (error) throw error;
      setEnrollFactorId(data.id);
      setQr(data.totp.qr_code);
      setSecret(data.totp.secret);
      setEnrolling(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal memulai enrollment");
    } finally {
      setBusy(false);
    }
  };

  const confirmEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollFactorId) return;
    setBusy(true);
    try {
      const { data: ch, error: cErr } = await supabase.auth.mfa.challenge({ factorId: enrollFactorId });
      if (cErr) throw cErr;
      const { error: vErr } = await supabase.auth.mfa.verify({
        factorId: enrollFactorId,
        challengeId: ch.id,
        code: code.trim(),
      });
      if (vErr) throw vErr;
      toast.success("2FA berhasil diaktifkan");
      setEnrolling(false);
      setQr(null);
      setSecret(null);
      setCode("");
      setEnrollFactorId(null);
      await refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Kode tidak valid");
    } finally {
      setBusy(false);
    }
  };

  const cancelEnroll = async () => {
    if (enrollFactorId) await supabase.auth.mfa.unenroll({ factorId: enrollFactorId });
    setEnrolling(false);
    setQr(null);
    setSecret(null);
    setCode("");
    setEnrollFactorId(null);
    await refresh();
  };

  const disable = async () => {
    if (!verified) return;
    if (!confirm("Nonaktifkan 2FA? Login berikutnya tidak akan meminta kode.")) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: verified.id });
      if (error) throw error;
      toast.success("2FA dinonaktifkan");
      await refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menonaktifkan");
    } finally {
      setBusy(false);
    }
  };

  const onToggle = (next: boolean) => {
    if (next && !enabled) startEnroll();
    else if (!next && enabled) disable();
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Keamanan Akun</h1>
        <p className="text-sm text-muted-foreground">Kelola verifikasi 2 langkah (2FA) untuk akun admin Anda.</p>
      </div>

      <Card className="rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                enabled ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"
              }`}
            >
              {enabled ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">Google Authenticator (TOTP)</h2>
                {enabled ? (
                  <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15">Aktif</Badge>
                ) : (
                  <Badge variant="secondary">Nonaktif</Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Saat aktif, login akan meminta kode 6-digit dari aplikasi Authenticator (Google Authenticator, Authy, 1Password, dll).
              </p>
            </div>
          </div>
          {!enrolling && (
            <Switch checked={enabled} onCheckedChange={onToggle} disabled={busy || loading} />
          )}
        </div>

        {loading && (
          <div className="mt-6 flex items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat…
          </div>
        )}

        {enrolling && qr && (
          <form onSubmit={confirmEnroll} className="mt-6 space-y-5 rounded-xl border bg-muted/30 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Smartphone className="h-4 w-4 text-primary" /> Langkah 1 — Scan QR
            </div>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
              <div className="rounded-xl bg-white p-3 shadow-sm">
                {/* Supabase returns SVG data URL */}
                <img src={qr} alt="QR 2FA" className="h-44 w-44" />
              </div>
              <div className="flex-1 space-y-2 text-sm">
                <p className="text-muted-foreground">Buka aplikasi Authenticator → tambah akun → Scan QR.</p>
                <p className="text-muted-foreground">Atau masukkan kunci manual:</p>
                {secret && (
                  <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 font-mono text-xs">
                    <span className="flex-1 break-all">{secret}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard.writeText(secret);
                        toast.success("Disalin");
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <KeyRound className="h-4 w-4 text-primary" /> Langkah 2 — Konfirmasi kode
              </div>
              <Label htmlFor="confirm-code" className="text-xs uppercase tracking-wide text-muted-foreground">
                Masukkan kode 6-digit
              </Label>
              <Input
                id="confirm-code"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="h-12 text-center text-xl font-bold tracking-[0.4em]"
                required
              />
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" onClick={cancelEnroll} disabled={busy}>
                Batal
              </Button>
              <Button type="submit" disabled={busy || code.length !== 6}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Aktifkan 2FA
              </Button>
            </div>
          </form>
        )}
      </Card>

      <Card className="rounded-2xl p-6 text-sm text-muted-foreground">
        <h3 className="mb-2 font-semibold text-foreground">Tips Keamanan</h3>
        <ul className="list-disc space-y-1 pl-5">
          <li>Simpan kunci manual di tempat aman sebagai cadangan jika perangkat hilang.</li>
          <li>Gunakan password kuat & unik untuk akun admin.</li>
          <li>Jangan bagikan kode 6-digit kepada siapa pun.</li>
        </ul>
      </Card>
    </div>
  );
}
