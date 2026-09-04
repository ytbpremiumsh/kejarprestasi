import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  actions?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,.06)] sm:p-7">
      <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-violet-100/70 blur-2xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[.2em] text-violet-600">{eyebrow}</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
    </section>
  );
}

export function AdminMetric({ label, value, helper, icon: Icon, tone = "violet" }: {
  label: string;
  value: ReactNode;
  helper?: string;
  icon: LucideIcon;
  tone?: "violet" | "emerald" | "amber" | "sky" | "slate";
}) {
  const tones = {
    violet: "bg-violet-50 text-violet-700 ring-violet-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    sky: "bg-sky-50 text-sky-700 ring-sky-100",
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
  };
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,.045)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">{value}</p>
          {helper && <p className="mt-1 text-[11px] text-slate-400">{helper}</p>}
        </div>
        <span className={cn("grid h-10 w-10 place-items-center rounded-xl ring-1", tones[tone])}><Icon className="h-4.5 w-4.5" /></span>
      </div>
    </div>
  );
}

export const adminPanelClass = "rounded-[24px] border border-slate-200/80 bg-white shadow-[0_14px_40px_rgba(15,23,42,.055)]";

export function CategoryPill({ kind }: { kind: string }) {
  const style = kind === "prestasi" ? "bg-violet-50 text-violet-700 ring-violet-200" : kind === "ekonomi" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-sky-50 text-sky-700 ring-sky-200";
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ring-1", style)}>{kind}</span>;
}
