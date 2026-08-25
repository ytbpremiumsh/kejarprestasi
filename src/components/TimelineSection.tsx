import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Calendar,
  Check,
  FileText,
  GraduationCap,
  Share2,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserCheck,
} from "lucide-react";

export type Stage = { title: string; desc: string; date: string; startDate?: string; singleDay?: boolean };

const fallback: Stage[] = [
  { title: "Pendaftaran Dibuka", desc: "Calon peserta mengisi formulir pendaftaran beasiswa secara online.", date: "2026-11-16", startDate: "2026-11-16" },
  { title: "Bagikan Poster", desc: "Peserta membagikan poster beasiswa ke media sosial sebagai bagian dari tahapan seleksi.", date: "2026-11-16", startDate: "2026-11-16" },
  { title: "Berkas Administrasi", desc: "Peserta mengunggah seluruh berkas pendukung sesuai persyaratan yang ditentukan.", date: "2026-11-16", startDate: "2026-11-16" },
  { title: "Seleksi Administrasi", desc: "Tim panitia memeriksa kelengkapan data dan keabsahan berkas pendaftar.", date: "2026-11-21", startDate: "2026-11-17" },
  { title: "Verifikasi", desc: "Validasi akhir terhadap dokumen dan data peserta yang lolos administrasi.", date: "2026-11-27", startDate: "2026-11-22" },
  { title: "Pengumuman Kandidat", desc: "Pengumuman peserta yang lolos sebagai kandidat dan berhak mengikuti TPA.", date: "2026-11-28", startDate: "2026-11-28", singleDay: true },
  { title: "Tes Potensi Akademik (TPA)", desc: "Peserta mengikuti tes online serentak untuk mengukur kemampuan akademik.", date: "2026-11-29", startDate: "2026-11-29", singleDay: true },
  { title: "Pengumuman Finalis", desc: "Pengumuman peserta yang lolos sebagai finalis penerima beasiswa.", date: "2026-12-05", startDate: "2026-12-05", singleDay: true },
  { title: "Awarding", desc: "Penyerahan beasiswa dan merchandise resmi kepada para penerima.", date: "2026-12-19", startDate: "2026-12-19", singleDay: true },
];

function fmt(d: string) {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function statusOf(stages: Stage[], i: number) {
  const now = new Date().getTime();
  const cur = stages[i];
  if (!cur) return "Akan Datang";

  const curStart = cur.startDate ? new Date(cur.startDate).getTime() : NaN;
  const curEnd = cur.date ? new Date(cur.date).getTime() : NaN;
  const start = isNaN(curStart) ? curEnd : curStart;
  const end = isNaN(curEnd) ? start : curEnd + 24 * 60 * 60 * 1000 - 1;

  if (isNaN(start)) return "Akan Datang";
  if (now < start) return "Akan Datang";
  if (now <= end) return "Berlangsung";
  return "Selesai";
}

function iconFor(title: string) {
  const t = title.toLowerCase();
  if (t.includes("pendaftaran")) return GraduationCap;
  if (t.includes("poster") || t.includes("bagikan")) return Share2;
  if (t.includes("berkas") || t.includes("pengumpulan")) return FileText;
  if (t.includes("seleksi")) return ShieldCheck;
  if (t.includes("verifikasi")) return UserCheck;
  if (t.includes("tes")) return Sparkles;
  if (t.includes("awarding")) return Trophy;
  return Check;
}

export function TimelineSection() {
  const [stages, setStages] = useState<Stage[]>(fallback);
  const [active, setActive] = useState(0);

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

  useEffect(() => {
    if (active >= stages.length) setActive(Math.max(0, stages.length - 1));
  }, [active, stages.length]);

  const selected = stages[active] ?? stages[0];
  const selectedStatus = selected ? statusOf(stages, active) : "Akan Datang";
  const progress = stages.length > 1 ? (active / (stages.length - 1)) * 100 : 0;
  const SelectedIcon = useMemo(() => iconFor(selected?.title ?? ""), [selected?.title]);

  return (
    <section id="timeline" className="relative overflow-hidden border-y border-border bg-secondary/40">
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />

      <div className="container-page relative py-20 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles size={13} /> Timeline Gelombang Section #3
          </span>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight text-foreground md:text-4xl">
            Perjalanan Menuju Beasiswa
          </h2>
          <p className="mt-3 text-muted-foreground">
            Pilih setiap tahap untuk melihat detail proses, jadwal, status, dan aksi yang tersedia.
          </p>
        </div>

        {/* Interactive step selector — intentionally not a vertical timeline */}
        <div className="mt-12">
          <div className="relative hidden md:block" aria-hidden="true">
            <div className="absolute left-8 right-8 top-8 h-1 rounded-full bg-border" />
            <div
              className="absolute left-8 top-8 h-1 rounded-full bg-gradient-to-r from-primary to-gold transition-all duration-500"
              style={{ width: `calc((100% - 64px) * ${progress / 100})` }}
            />
          </div>

          <div className="flex gap-3 overflow-x-auto pb-3 md:grid md:grid-cols-9 md:gap-2 md:overflow-visible md:pb-0">
            {stages.map((stage, i) => {
              const Icon = iconFor(stage.title);
              const status = statusOf(stages, i);
              const isActive = i === active;
              const isDone = status === "Selesai";

              return (
                <button
                  key={`${stage.title}-${i}`}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-current={isActive ? "step" : undefined}
                  className={`group relative min-w-[92px] rounded-2xl border p-3 text-center transition-all duration-300 md:min-w-0 md:border-0 md:bg-transparent md:p-0 ${
                    isActive ? "border-primary/30 bg-card shadow-card md:shadow-none" : "border-border bg-card/60 hover:border-primary/20 hover:bg-card md:bg-transparent"
                  }`}
                >
                  <span
                    className={`relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border shadow-card transition-all duration-300 ${
                      isActive
                        ? "scale-110 border-primary bg-primary text-primary-foreground shadow-soft"
                        : isDone
                        ? "border-primary/20 bg-primary-soft text-primary"
                        : "border-border bg-card text-muted-foreground group-hover:border-primary/30 group-hover:text-primary"
                    }`}
                  >
                    <Icon size={21} />
                  </span>
                  <span className={`mt-3 block text-[11px] font-semibold leading-tight ${isActive ? "text-primary" : "text-foreground/75"}`}>
                    {stage.title}
                  </span>
                  <span className="mt-1 block text-[10px] text-muted-foreground">Tahap {i + 1}</span>
                </button>
              );
            })}
          </div>
        </div>

        {selected && (
          <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft">
            <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
              <div className="relative overflow-hidden p-7 md:p-9" style={{ background: "var(--gradient-primary)" }}>
                <div aria-hidden="true" className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gold/25 blur-2xl" />
                <div className="relative">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-primary-foreground/15 px-3 py-1 text-[11px] font-semibold text-primary-foreground backdrop-blur">
                      Tahap {active + 1} dari {stages.length}
                    </span>
                    <span className="rounded-full bg-primary-foreground/15 px-3 py-1 text-[11px] font-semibold text-primary-foreground backdrop-blur">
                      {selectedStatus}
                    </span>
                  </div>

                  <div className="mt-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/15 text-primary-foreground ring-1 ring-primary-foreground/20 backdrop-blur">
                    <SelectedIcon size={30} />
                  </div>
                  <h3 className="mt-6 text-2xl font-extrabold leading-tight text-primary-foreground md:text-3xl">
                    {selected.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-primary-foreground/75">
                    {selected.desc}
                  </p>
                </div>
              </div>

              <div className="p-7 md:p-9">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">Jadwal Tahap</p>
                    <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Calendar size={17} className="text-primary" />
                      {selected.startDate && selected.startDate !== selected.date ? (
                        <>{fmt(selected.startDate)} – {selected.singleDay ? fmt(selected.date) : `Hingga ${fmt(selected.date)}`}</>
                      ) : selected.date ? (
                        selected.singleDay ? fmt(selected.date) : `Hingga ${fmt(selected.date)}`
                      ) : "—"}
                    </div>
                  </div>
                  <div className="hidden h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary sm:flex">
                    <SelectedIcon size={20} />
                  </div>
                </div>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-secondary/50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</p>
                    <p className="mt-1 font-bold text-foreground">{selectedStatus}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-secondary/50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Progress</p>
                    <p className="mt-1 font-bold text-foreground">{Math.round(progress)}%</p>
                  </div>
                </div>

                <StageActions title={selected.title} />

                <div className="mt-7 flex items-center justify-between border-t border-border pt-5">
                  <button
                    type="button"
                    onClick={() => setActive((v) => Math.max(0, v - 1))}
                    disabled={active === 0}
                    className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground transition hover:border-primary/30 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
                  >
                    Sebelumnya
                  </button>
                  <button
                    type="button"
                    onClick={() => setActive((v) => Math.min(stages.length - 1, v + 1))}
                    disabled={active === stages.length - 1}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:opacity-95 disabled:pointer-events-none disabled:opacity-40"
                  >
                    Tahap Berikutnya <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function StageActions({ title }: { title: string }) {
  const t = title.toLowerCase();

  if (t.includes("pendaftaran")) {
    return (
      <div className="mt-6">
        <Link to="/daftar" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-soft transition hover:-translate-y-0.5 hover:opacity-95">
          <Trophy size={14} /> Daftar Sekarang <ArrowRight size={12} />
        </Link>
      </div>
    );
  }

  if (t.includes("poster") || t.includes("bagikan")) {
    return (
      <div className="mt-6">
        <Link to="/bagikan-poster" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-soft transition hover:-translate-y-0.5 hover:opacity-95">
          <Share2 size={14} /> Bagikan Poster <ArrowRight size={12} />
        </Link>
      </div>
    );
  }

  if (t.includes("berkas") || t.includes("pengumpulan")) {
    return (
      <div className="mt-6">
        <Link to="/berkas" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-soft transition hover:-translate-y-0.5 hover:opacity-95">
          <FileText size={14} /> Kirim Berkas <ArrowRight size={12} />
        </Link>
      </div>
    );
  }

  return null;
}
