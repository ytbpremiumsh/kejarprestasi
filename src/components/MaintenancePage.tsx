import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Clock3, LockKeyhole, Mail, MessageCircle, RefreshCw, Settings2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export type MaintenanceConfig = {
  enabled?: boolean;
  title?: string;
  message?: string;
  eta?: string;
  contact_email?: string;
  contact_whatsapp?: string;
};

function useCountdown(target?: string) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!target) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  if (!target) return null;
  const targetTime = new Date(target).getTime();
  if (!Number.isFinite(targetTime)) return null;
  const diff = Math.max(0, targetTime - now);

  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
    done: diff === 0,
  };
}

export function MaintenancePage({ config }: { config: MaintenanceConfig }) {
  const countdown = useCountdown(config.eta);
  const title = config.title || "Website Sedang Diperbarui";
  const message = config.message || "Kami sedang meningkatkan sistem agar layanan dapat digunakan dengan lebih nyaman dan optimal. Silakan kembali beberapa saat lagi.";
  const whatsapp = config.contact_whatsapp?.replace(/\D/g, "");

  return <div data-maintenance-page="true" className="relative min-h-screen overflow-hidden bg-[#f8f8fc] text-foreground">
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[.28] [background-image:linear-gradient(to_right,color-mix(in_oklab,var(--primary)_7%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--primary)_7%,transparent)_1px,transparent_1px)] [background-size:52px_52px]" />
    <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-48 h-[36rem] w-[36rem] rounded-full bg-primary/10 blur-3xl" />
    <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -left-40 h-[32rem] w-[32rem] rounded-full bg-primary/5 blur-3xl" />

    <main className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-5 py-8 sm:px-8 sm:py-12">
      <section className="w-full overflow-hidden rounded-[2rem] border border-border/80 bg-white shadow-[0_28px_90px_rgba(15,23,42,.10)]">
        <div className="grid lg:grid-cols-[.78fr_1.22fr]">
          <aside className="relative overflow-hidden border-b border-primary/10 bg-primary-soft/55 p-7 sm:p-10 lg:border-b-0 lg:border-r">
            <div aria-hidden="true" className="absolute -right-20 -top-24 h-64 w-64 rounded-full border-[34px] border-white/45" />
            <div className="relative flex h-full min-h-[270px] flex-col">
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/85 px-3.5 py-2 text-[10px] font-black uppercase tracking-[.15em] text-primary shadow-sm"><ShieldCheck size={14}/> Kejar Prestasi</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40"/><span className="relative inline-flex h-2 w-2 rounded-full bg-primary"/></span> Maintenance</span>
              </div>

              <div className="my-auto py-10">
                <div className="relative w-fit">
                  <div className="absolute inset-0 rounded-[1.4rem] bg-primary/20 blur-xl" />
                  <span className="relative grid h-20 w-20 place-items-center rounded-[1.4rem] border border-primary/15 bg-white text-primary shadow-[0_16px_35px_rgba(75,45,150,.16)]"><Settings2 size={34}/></span>
                  <span className="absolute -bottom-2 -right-2 grid h-8 w-8 place-items-center rounded-full border-4 border-primary-soft bg-primary text-white"><CheckCircle2 size={14}/></span>
                </div>
                <p className="mt-7 text-xs font-black uppercase tracking-[.18em] text-primary">Peningkatan Sistem</p>
                <h2 className="mt-2 max-w-sm text-2xl font-black leading-tight sm:text-3xl">Kami sedang menyiapkan pengalaman yang lebih baik.</h2>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white bg-white/70 p-4 text-xs leading-5 text-muted-foreground shadow-sm"><ShieldCheck size={18} className="shrink-0 text-primary"/><span>Data dan layanan tetap terlindungi selama proses pemeliharaan berlangsung.</span></div>
            </div>
          </aside>

          <div className="p-7 sm:p-10 lg:p-12">
            <p className="text-xs font-black uppercase tracking-[.18em] text-primary">Informasi Layanan</p>
            <h1 className="mt-3 max-w-2xl text-3xl font-black leading-[1.12] tracking-tight sm:text-4xl lg:text-5xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">{message}</p>

            {countdown && !countdown.done && <div className="mt-8 rounded-2xl border border-border bg-slate-50/80 p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-[.14em] text-muted-foreground"><Clock3 size={15} className="text-primary"/> Estimasi kembali online</div>
              <div className="grid grid-cols-4 gap-2 sm:gap-3">{[
                { value: countdown.days, label: "Hari" },
                { value: countdown.hours, label: "Jam" },
                { value: countdown.minutes, label: "Menit" },
                { value: countdown.seconds, label: "Detik" },
              ].map((item) => <div key={item.label} className="rounded-xl border border-border/70 bg-white px-2 py-3 text-center shadow-sm sm:py-4"><div className="text-xl font-black tabular-nums sm:text-2xl">{String(item.value).padStart(2, "0")}</div><div className="mt-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{item.label}</div></div>)}</div>
            </div>}

            {countdown?.done && <div className="mt-8 rounded-2xl border border-primary/15 bg-primary-soft/40 p-4 text-sm font-semibold text-primary">Estimasi pemeliharaan telah selesai. Silakan periksa kembali website.</div>}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button size="lg" onClick={() => window.location.reload()} className="min-h-12 rounded-xl px-6 font-extrabold"><RefreshCw className="mr-2 h-4 w-4"/> Periksa Kembali</Button>
              {whatsapp && <Button asChild size="lg" variant="outline" className="min-h-12 rounded-xl px-6"><a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer"><MessageCircle className="mr-2 h-4 w-4"/> Hubungi WhatsApp <ArrowRight className="ml-2 h-4 w-4"/></a></Button>}
              {config.contact_email && <Button asChild size="lg" variant="outline" className="min-h-12 rounded-xl px-6"><a href={`mailto:${config.contact_email}`}><Mail className="mr-2 h-4 w-4"/> Hubungi Email</a></Button>}
            </div>

            <div className="mt-9 flex flex-col gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>© {new Date().getFullYear()} Beasiswa Kejar Prestasi</span>
              <a href="/login" className="inline-flex w-fit items-center gap-2 font-semibold transition hover:text-primary"><LockKeyhole className="h-3.5 w-3.5"/> Akses Administrator</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>;
}
