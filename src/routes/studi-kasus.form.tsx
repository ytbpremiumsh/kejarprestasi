import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, MessageSquareText, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { AdSlot } from "@/components/ads/AdSlot";
import { supabase } from "@/integrations/supabase/client";
import { clearStudyAccess, readStudyAccess, studyCases, studyLabel, studyNextPath, type StudyAccess } from "@/lib/study-case";

export const Route = createFileRoute("/studi-kasus/form")({
  head: () => ({ meta: [{ title: "Pengisian Studi Kasus — Kejar Prestasi" }, { name: "description", content: "Form pengisian Studi Kasus untuk pendaftar yang telah terverifikasi." }] }),
  component: StudyCaseFormPage,
});

function StudyCaseFormPage() {
  const [access] = useState<StudyAccess | null>(() => readStudyAccess());
  const [checking, setChecking] = useState(true);
  const [answers, setAnswers] = useState<string[]>(Array(5).fill(""));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!access) { window.location.replace("/studi-kasus"); return; }
    let active = true;
    supabase.functions.invoke("lookup-pendaftar", { body: { token: access.token, kind: access.kind } }).then(({ data, error }) => {
      if (!active) return;
      if (error || !data?.ok) { clearStudyAccess(); toast.error("Sesi validasi tidak berlaku. Silakan validasi ulang."); window.location.replace("/studi-kasus"); return; }
      setChecking(false);
    });
    return () => { active = false; };
  }, [access]);

  if (!access || checking) return <main className="grid min-h-[55vh] place-items-center"><div className="text-center"><Loader2 className="mx-auto animate-spin text-primary"/><p className="mt-3 text-sm text-muted-foreground">Memeriksa sesi validasi...</p></div></main>;
  const ready = answers.filter(answer => answer.trim().length >= 80).length;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if (ready < 5) return toast.error("Setiap jawaban minimal 80 karakter."); setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("lookup-pendaftar", { body: { token: access.token, kind: access.kind } });
      if (error || !data?.ok) throw new Error("verification_failed");
      const payload = { token: access.token, kind: access.kind, answers, submitted_at: new Date().toISOString() };
      localStorage.setItem(`kp-study-${access.token}`, JSON.stringify(payload));
      const { error: saveError } = await supabase.from("site_settings").upsert({ key: `study_case_${access.token.toLowerCase()}`, value: payload as never });
      if (saveError) throw saveError;
      clearStudyAccess(); toast.success("Studi kasus berhasil dikirim");
      window.location.assign(`${studyNextPath(access.kind)}?token=${encodeURIComponent(access.token)}`);
    } catch { toast.error("Pengiriman ditolak karena validasi kode tidak lagi sesuai atau penyimpanan gagal."); } finally { setSubmitting(false); }
  };

  return <main><section className="border-b border-border bg-secondary/25"><div className="container-page py-10 md:py-14"><span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.18em] text-primary"><MessageSquareText size={15}/> Tahap 3 · Pengisian Studi Kasus</span><h1 className="mt-3 text-3xl font-extrabold leading-tight md:text-5xl">Studi Kasus Beasiswa {studyLabel(access.kind)}</h1><p className="mt-3 max-w-2xl leading-7 text-muted-foreground">Lengkapi lima jawaban berikut. Kode pendaftaran telah divalidasi pada halaman sebelumnya.</p></div></section><AdSlot placement="study_form_top"/><form onSubmit={submit} className="container-page py-8 md:py-12"><div className="mb-5 rounded-2xl border border-primary/20 bg-primary-soft/40 p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground"><UserCheck size={17}/></div><div><p className="text-xs font-bold text-primary">Pendaftar Terverifikasi</p><h2 className="font-extrabold">{access.registrant.full_name}</h2><p className="text-xs text-muted-foreground">{access.token} · Beasiswa {studyLabel(access.kind)}</p></div></div><button type="button" onClick={() => { clearStudyAccess(); window.location.assign("/studi-kasus"); }} className="text-left text-xs font-bold text-primary">Validasi kode lain</button></div></div><div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]"><aside className="h-fit rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-28"><MessageSquareText className="text-primary"/><p className="mt-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Progress Jawaban</p><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-primary transition-all" style={{ width: `${ready * 20}%` }}/></div><p className="mt-2 text-[11px] text-muted-foreground">{ready} dari 5 jawaban siap</p><div className="mt-5 rounded-xl bg-secondary/60 p-3 text-xs leading-5 text-muted-foreground"><CheckCircle2 size={15} className="mb-2 text-primary"/>Sesi validasi berlaku selama 30 menit.</div></aside><div className="space-y-4">{studyCases[access.kind].map((question, index) => <section key={question} className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-7"><div className="flex items-start gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-xs font-extrabold text-primary-foreground">{index + 1}</span><h3 className="text-sm font-bold leading-6 md:text-base">{question}</h3></div><textarea value={answers[index]} onChange={event => setAnswers(current => current.map((answer, answerIndex) => answerIndex === index ? event.target.value : answer))} rows={6} placeholder="Tulis jawaban secara jelas dan terstruktur..." className="mt-5 w-full resize-y rounded-xl border border-border bg-background p-4 text-sm leading-6 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"/><p className={`mt-2 text-right text-[11px] ${answers[index].trim().length >= 80 ? "font-bold text-primary" : "text-muted-foreground"}`}>{answers[index].trim().length} / minimal 80 karakter</p></section>)}<button disabled={submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-sm font-extrabold text-primary-foreground disabled:opacity-50">{submitting && <Loader2 size={16} className="animate-spin"/>}Kirim Studi Kasus & Lanjut Administrasi <ArrowRight size={16}/></button></div></div></form><AdSlot placement="study_form_bottom"/></main>;
}
