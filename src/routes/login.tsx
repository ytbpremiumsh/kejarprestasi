import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Fingerprint, KeyRound, Loader2, Lock, Mail, ShieldCheck, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { ADMIN_DEMO_EMAIL, ADMIN_DEMO_PASSWORD, startAdminDemo } from "@/lib/admin-demo";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login Administrator — Kejar Prestasi" }, { name: "robots", content: "noindex,nofollow,noarchive,nosnippet" }] }),
  component: LoginPage,
});

type Step = "credentials" | "mfa";

function LoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      supabase.auth.mfa.getAuthenticatorAssuranceLevel().then(({ data: aal }) => {
        if (!aal || aal.currentLevel === aal.nextLevel) navigate({ to: "/admin" });
      });
    });
  }, [navigate]);

  const openMfaChallenge = async () => {
    const { data: factors, error } = await supabase.auth.mfa.listFactors();
    if (error) throw error;
    const totp = factors.totp.find((factor) => factor.status === "verified");
    if (!totp) { navigate({ to: "/admin" }); return; }
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: totp.id });
    if (challengeError) throw challengeError;
    setFactorId(totp.id);
    setChallengeId(challenge.id);
    setStep("mfa");
  };

  const afterPassword = async () => {
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.nextLevel === "aal2" && aal.currentLevel === "aal1") return openMfaChallenge();
    navigate({ to: "/admin" });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true);
    try {
      if (email.trim().toLowerCase() === ADMIN_DEMO_EMAIL && password === ADMIN_DEMO_PASSWORD) {
        startAdminDemo(); window.location.assign("/admin"); return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      await afterPassword();
    } catch { toast.error("Email atau password tidak dapat diverifikasi"); }
    finally { setLoading(false); }
  };

  const verify = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!factorId || !challengeId) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.mfa.verify({ factorId, challengeId, code: otp });
      if (error) throw error;
      toast.success("Verifikasi 2FA berhasil");
      navigate({ to: "/admin" });
    } catch { toast.error("Kode autentikator tidak valid atau sudah kedaluwarsa"); }
    finally { setLoading(false); }
  };

  const cancel = async () => {
    await supabase.auth.signOut();
    setStep("credentials"); setOtp(""); setFactorId(null); setChallengeId(null);
  };

  return <main className="relative min-h-screen overflow-hidden bg-white text-foreground">
    <div className="pointer-events-none absolute inset-0 opacity-[.22] [background-image:linear-gradient(to_right,color-mix(in_oklab,var(--primary)_8%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--primary)_8%,transparent)_1px,transparent_1px)] [background-size:52px_52px]" />
    <div className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-primary/10 blur-3xl" />
    <div className="relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-5 py-10 lg:grid-cols-[.9fr_1.1fr] lg:px-8">
      <section className="hidden rounded-[2.25rem] border border-primary/10 bg-primary-soft/50 p-10 lg:block">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[.16em] text-primary"><ShieldCheck size={15}/> Kejar Prestasi</span>
        <h1 className="mt-8 max-w-md text-4xl font-black leading-tight">Akses dashboard yang aman dan terkendali.</h1>
        <p className="mt-4 max-w-md leading-7 text-muted-foreground">Kelola program, pendaftar, dan administrasi melalui pusat kontrol khusus administrator.</p>
        <div className="mt-10 grid gap-3">
          {["Verifikasi akun administrator", "Dukungan autentikasi 2 langkah", "Akun demo terpisah dari data produksi"].map((item) => <div key={item} className="flex items-center gap-3 rounded-2xl border border-white bg-white/80 p-4 text-sm font-bold shadow-card"><span className="grid h-8 w-8 place-items-center rounded-full bg-primary-soft text-primary"><CheckCircle2 size={16}/></span>{item}</div>)}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[470px]">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-primary"><ArrowLeft size={15}/> Kembali ke Beranda</Link>
        <div className="rounded-[2rem] border border-border bg-white p-7 shadow-[0_24px_70px_rgba(15,23,42,.10)] sm:p-10">
          <div className="flex items-start justify-between gap-4">
            <span className="grid h-[52px] w-[52px] place-items-center rounded-2xl border border-primary/15 bg-primary-soft text-primary shadow-card">{step === "mfa" ? <Smartphone size={23}/> : <Fingerprint size={23}/>}</span>
            <span className="rounded-full border border-border bg-slate-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">{step === "mfa" ? "2FA aktif" : "Admin Login"}</span>
          </div>
          <h2 className="mt-7 text-3xl font-black tracking-tight">{step === "mfa" ? "Verifikasi dua langkah" : "Selamat datang kembali"}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{step === "mfa" ? "Masukkan kode 6 digit dari aplikasi Authenticator yang terhubung dengan akun Anda." : "Masukkan kredensial administrator untuk membuka dashboard."}</p>

          {step === "credentials" ? <form onSubmit={submit} className="mt-8 space-y-5">
            <div><Label htmlFor="admin-email" className="text-xs font-bold">Email Administrator</Label><div className="relative mt-2"><Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input id="admin-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" className="h-[52px] rounded-xl bg-slate-50 pl-11" placeholder="admin@kejarprestasi.id"/></div></div>
            <div><Label htmlFor="admin-password" className="text-xs font-bold">Password</Label><div className="relative mt-2"><Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input id="admin-password" type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" className="h-[52px] rounded-xl bg-slate-50 pl-11" placeholder="Masukkan password"/></div></div>
            <Button className="h-[52px] w-full rounded-xl font-extrabold" disabled={loading}>{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <ShieldCheck className="mr-2 h-4 w-4"/>}Masuk ke Dashboard</Button>
          </form> : <form onSubmit={verify} className="mt-8 space-y-5">
            <div><Label htmlFor="otp-code" className="text-xs font-bold">Kode Authenticator</Label><Input id="otp-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} className="mt-2 h-16 rounded-xl bg-slate-50 text-center text-2xl font-black tracking-[.45em]" placeholder="000000" autoFocus/></div>
            <Button className="h-[52px] w-full rounded-xl font-extrabold" disabled={loading || otp.length !== 6}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Verifikasi & Masuk</Button>
            <button type="button" onClick={cancel} className="flex w-full items-center justify-center gap-2 text-xs font-bold text-muted-foreground"><ArrowLeft size={13}/> Kembali ke login</button>
          </form>}
          <div className="mt-7 flex items-start gap-2 border-t border-border pt-5 text-[11px] leading-5 text-muted-foreground"><KeyRound size={15} className="mt-0.5 shrink-0 text-primary"/>2FA dapat diaktifkan atau dinonaktifkan melalui Dashboard Admin → Keamanan (2FA).</div>
        </div>
      </section>
    </div>
  </main>;
}
