import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, GraduationCap, HeartHandshake, KeyRound, Loader2, MessageSquareText, ShieldCheck, Trophy } from "lucide-react";
import { toast } from "sonner";
import { AdSlot } from "@/components/ads/AdSlot";
import { supabase } from "@/integrations/supabase/client";
import { saveStudyAccess, studyLabel, studyPrefix, type StudyKind, type VerifiedRegistrant } from "@/lib/study-case";

export const Route = createFileRoute("/studi-kasus")({
  head: () => ({ meta: [{ title: "Validasi Studi Kasus — Kejar Prestasi" }, { name: "description", content: "Validasi kode pendaftaran sebelum mengisi Studi Kasus Kejar Prestasi." }] }),
  component: StudyCaseValidationPage,
});

function StudyCaseValidationPage() {
  const [kind, setKind] = useState<StudyKind | null>(null);
  return <main><section className="border-b border-border bg-secondary/25"><div className="container-page py-10 md:py-14"><Link to="/" className="text-xs font-bold text-primary">← Beranda</Link><div className="mt-5 max-w-3xl"><span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.18em] text-primary"><MessageSquareText size={15}/> Tahap 3 · Validasi Studi Kasus</span><h1 className="mt-3 text-3xl font-extrabold leading-tight md:text-5xl">Validasi kode pendaftaran terlebih dahulu.</h1><p className="mt-3 max-w-2xl leading-7 text-muted-foreground">Pilih kategori dan masukkan kode pendaftaran. Setelah kode dinyatakan valid, kamu akan diarahkan ke halaman pengisian Studi Kasus.</p></div></div></section><AdSlot placement="study_validation_top"/><section className="container-page py-8 md:py-12">{kind ? <VerificationGate kind={kind} onBack={() => setKind(null)}/> : <div className="grid gap-4 md:grid-cols-3"><Choice kind="prestasi" icon={<Trophy/>} desc="Gunakan kode KP-PRE sesuai pendaftaranmu." onClick={() => setKind("prestasi")}/><Choice kind="ekonomi" icon={<HeartHandshake/>} desc="Gunakan kode KP-EKO sesuai pendaftaranmu." onClick={() => setKind("ekonomi")}/><Choice kind="umum" icon={<GraduationCap/>} desc="Gunakan kode KP-UMM sesuai pendaftaranmu." onClick={() => setKind("umum")}/></div>}</section><AdSlot placement="study_validation_bottom"/></main>;
}

function Choice({ kind, icon, desc, onClick }: { kind: StudyKind; icon: React.ReactNode; desc: string; onClick: () => void }) {
  return <button onClick={onClick} className="group flex min-h-48 flex-col justify-between rounded-2xl border border-border bg-card p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft"><div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">{icon}</div><div><h2 className="mt-6 text-xl font-extrabold">Beasiswa {studyLabel(kind)}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{desc}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">Validasi kode <ArrowRight size={15}/></span></div></button>;
}

function VerificationGate({ kind, onBack }: { kind: StudyKind; onBack: () => void }) {
  const [token, setToken] = useState(""); const [checking, setChecking] = useState(false); const [error, setError] = useState(""); const prefix = studyPrefix(kind);
  const verify = async () => {
    const normalized = token.trim().toUpperCase(); setError("");
    if (!normalized) return setError("Masukkan kode pendaftaran terlebih dahulu.");
    if (!normalized.startsWith(prefix)) return setError(`Kode tidak sesuai kategori. Gunakan kode yang diawali ${prefix}`);
    setChecking(true);
    try {
      const { data, error: lookupError } = await supabase.functions.invoke("lookup-pendaftar", { body: { token: normalized, kind } });
      if (lookupError || !data?.ok || !data?.data) return setError("Kode pendaftaran tidak valid, tidak ditemukan, atau tidak sesuai kategori.");
      saveStudyAccess(normalized, kind, data.data as VerifiedRegistrant);
      toast.success("Kode valid. Membuka halaman Studi Kasus...");
      window.location.assign("/studi-kasus/form");
    } catch { setError("Validasi gagal. Silakan coba kembali."); } finally { setChecking(false); }
  };
  return <div className="mx-auto max-w-2xl rounded-[2rem] border border-border bg-card p-6 shadow-card md:p-9"><div className="flex items-start gap-4"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary"><KeyRound/></div><div><p className="text-xs font-bold uppercase tracking-wider text-primary">Validasi Pendaftar</p><h2 className="mt-1 text-2xl font-extrabold">Kode Beasiswa {studyLabel(kind)}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Form Studi Kasus berada di halaman berikutnya dan hanya dapat dibuka setelah kode berhasil diverifikasi.</p></div></div><label className="mt-7 block text-sm font-bold">Kode Pendaftaran<input value={token} onChange={e => { setToken(e.target.value.toUpperCase()); setError(""); }} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); verify(); } }} placeholder={`${prefix}XXXXXX`} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3.5 font-mono text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"/></label>{error && <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">{error}</div>}<div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><button type="button" onClick={onBack} className="rounded-xl border border-border px-5 py-3 text-sm font-bold">Ganti kategori</button><button type="button" onClick={verify} disabled={checking} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground disabled:opacity-50">{checking ? <Loader2 size={16} className="animate-spin"/> : <ShieldCheck size={16}/>}Validasi & Buka Studi Kasus</button></div></div>;
}
