import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, FileText, HeartHandshake, Trophy } from "lucide-react";

export type Stage = { title: string; desc: string; date: string };

const fallback: Stage[] = [
  { title: "Pendaftaran Dibuka", desc: "Pendaftar mengisi formulir secara online.", date: "" },
  { title: "Seleksi Administrasi", desc: "Tim verifikasi memeriksa data pendaftar.", date: "" },
  { title: "Pengumpulan Berkas", desc: "Pendaftar mengunggah berkas pendukung.", date: "" },
  { title: "Verifikasi", desc: "Validasi berkas dan kelengkapan dokumen.", date: "" },
  { title: "Pengumuman Finalis", desc: "Pengumuman finalis penerima beasiswa.", date: "" },
  { title: "Awarding", desc: "Penyerahan beasiswa & merchandise resmi.", date: "" },
];

function fmt(d: string) {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function statusOf(stages: Stage[], i: number) {
  const now = new Date().getTime();
  const cur = stages[i]?.date ? new Date(stages[i].date).getTime() : NaN;
  const next = stages[i + 1]?.date ? new Date(stages[i + 1].date).getTime() : Infinity;
  if (isNaN(cur)) return "Akan Datang";
  if (now < cur) return "Akan Datang";
  if (now >= cur && now < next) return "Berlangsung";
  return "Selesai";
}

export function TimelineSection() {
  const [stages, setStages] = useState<Stage[]>(fallback);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "timeline")
      .maybeSingle()
      .then(({ data }) => {
        if (Array.isArray(data?.value)) setStages(data.value as Stage[]);
      });
  }, []);

  return (
    <section id="timeline" className="bg-secondary/40 border-y border-border">
      <div className="container-page py-20">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            Timeline Gelombang Section #3
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-foreground">
            Tahapan Seleksi Beasiswa
          </h2>
          <p className="mt-3 text-muted-foreground">
            Ikuti setiap tahap dengan teliti agar dapat lolos hingga awarding.
          </p>
        </div>

        <ol className="mt-12 relative max-w-3xl mx-auto">
          <span className="absolute left-4 md:left-5 top-0 bottom-0 w-px bg-border" aria-hidden />
          {stages.map((t, i) => {
            const status = statusOf(stages, i);
            return (
              <li key={i} className="relative pl-12 md:pl-16 pb-8 last:pb-0">
                <span className="absolute left-0 top-0 flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-soft">
                  {i + 1}
                </span>
                <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <h3 className="font-semibold text-foreground">{t.title}</h3>
                    <span
                      className={`text-[11px] font-semibold rounded-full px-2.5 py-1 whitespace-nowrap ${
                        status === "Berlangsung"
                          ? "bg-[oklch(0.92_0.13_85)] text-gold-foreground"
                          : status === "Selesai"
                          ? "bg-muted text-muted-foreground"
                          : "bg-primary-soft text-primary"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">{t.desc}</p>
                  <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-foreground/80">
                    <Calendar size={14} className="text-primary" />
                    {fmt(t.date)}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
