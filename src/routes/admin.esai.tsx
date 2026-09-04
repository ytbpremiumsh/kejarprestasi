import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PenLine, Search, RefreshCw, Eye, FileCheck2, Users, CircleDashed, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdminPageHeader, AdminMetric, CategoryPill, adminPanelClass } from "@/components/admin/AdminWorkspace";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/esai")({ component: AdminEsai });

type Kind = "prestasi" | "ekonomi" | "umum";
type Registration = { id: string; full_name: string; email: string; whatsapp: string; school_name: string; education_level: string; kind: Kind; token: string | null };
type EssayPayload = { token?: string; kind?: Kind; answers?: string[]; submitted_at?: string };
type EssayRow = EssayPayload & { key: string; updated_at: string; registration?: Registration };

function parsePayload(value: unknown): EssayPayload {
  if (typeof value === "string") { try { return JSON.parse(value) as EssayPayload; } catch { return {}; } }
  return value && typeof value === "object" ? value as EssayPayload : {};
}

function AdminEsai() {
  const [rows, setRows] = useState<EssayRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | Kind>("all");
  const [selected, setSelected] = useState<EssayRow | null>(null);

  const load = async () => {
    setLoading(true);
    const [essayRes, registrationRes] = await Promise.all([
      supabase.from("site_settings").select("key,value,updated_at").like("key", "study_case_%").order("updated_at", { ascending: false }),
      supabase.from("registrations").select("id,full_name,email,whatsapp,school_name,education_level,kind,token"),
    ]);
    if (essayRes.error) toast.error("Data esai gagal dimuat");
    const registrations = (registrationRes.data ?? []) as Registration[];
    const byToken = new Map(registrations.map((r) => [(r.token ?? "").toLowerCase(), r]));
    setRows((essayRes.data ?? []).map((item) => {
      const payload = parsePayload(item.value);
      const token = payload.token ?? item.key.replace("study_case_", "");
      return { ...payload, token, key: item.key, updated_at: item.updated_at, registration: byToken.get(token.toLowerCase()) };
    }));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => rows.filter((row) => {
    const resolvedKind = row.kind ?? row.registration?.kind;
    if (kind !== "all" && resolvedKind !== kind) return false;
    const term = query.toLowerCase();
    return !term || [row.token, row.registration?.full_name, row.registration?.email, row.registration?.school_name].some((v) => v?.toLowerCase().includes(term));
  }), [rows, kind, query]);
  const complete = rows.filter((r) => (r.answers?.filter(Boolean).length ?? 0) >= 5).length;

  return <div className="space-y-5">
    <AdminPageHeader eyebrow="Tahap 02 · Studi Kasus" title="Pengiriman Esai" description="Periksa jawaban studi kasus peserta, identitas pendaftaran, dan kelengkapan respons dalam satu layar." icon={PenLine} actions={<Button variant="outline" onClick={load}><RefreshCw className="mr-2 h-4 w-4"/>Muat ulang</Button>} />
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <AdminMetric label="Esai masuk" value={rows.length} helper="Semua kategori" icon={PenLine}/>
      <AdminMetric label="Jawaban lengkap" value={complete} helper="Minimal 5 jawaban" icon={FileCheck2} tone="emerald"/>
      <AdminMetric label="Terhubung pendaftar" value={rows.filter(r=>r.registration).length} helper="Kode registrasi cocok" icon={Users} tone="sky"/>
      <AdminMetric label="Perlu dicek" value={rows.length-complete} helper="Jawaban belum lengkap" icon={CircleDashed} tone="amber"/>
    </div>
    <section className={cn(adminPanelClass,"overflow-hidden")}>
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><Input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari nama, email, sekolah, atau kode registrasi" className="h-11 rounded-xl border-slate-200 pl-9"/></div>
        <select value={kind} onChange={e=>setKind(e.target.value as typeof kind)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="all">Semua kategori</option><option value="prestasi">Prestasi</option><option value="ekonomi">Ekonomi</option><option value="umum">Umum</option></select>
      </div>
      {loading ? <div className="grid min-h-48 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-violet-600"/></div> : filtered.length===0 ? <div className="py-16 text-center text-sm text-slate-500">Belum ada pengiriman esai yang sesuai.</div> : <>
        <div className="hidden overflow-x-auto md:block"><table className="w-full text-sm"><thead className="bg-slate-50 text-left text-[10px] font-black uppercase tracking-widest text-slate-400"><tr><th className="px-5 py-4">Peserta</th><th className="px-5 py-4">Kode</th><th className="px-5 py-4">Kategori</th><th className="px-5 py-4">Kelengkapan</th><th className="px-5 py-4">Dikirim</th><th className="px-5 py-4"></th></tr></thead><tbody>{filtered.map(row=><tr key={row.key} className="border-t border-slate-100 hover:bg-slate-50/70"><td className="px-5 py-4"><p className="font-bold text-slate-900">{row.registration?.full_name??"Peserta tidak ditemukan"}</p><p className="text-xs text-slate-500">{row.registration?.email??"Kode belum terhubung"}</p></td><td className="px-5 py-4 font-mono text-xs font-bold">{row.token}</td><td className="px-5 py-4"><CategoryPill kind={row.kind??row.registration?.kind??"umum"}/></td><td className="px-5 py-4"><span className="font-bold text-slate-700">{row.answers?.filter(Boolean).length??0}/5</span> jawaban</td><td className="px-5 py-4 text-xs text-slate-500">{new Date(row.submitted_at??row.updated_at).toLocaleString("id-ID")}</td><td className="px-5 py-4"><Button size="sm" variant="outline" onClick={()=>setSelected(row)}><Eye className="mr-1.5 h-4 w-4"/>Detail</Button></td></tr>)}</tbody></table></div>
        <div className="space-y-3 p-3 md:hidden">{filtered.map(row=><button key={row.key} onClick={()=>setSelected(row)} className="w-full rounded-2xl border border-slate-200 p-4 text-left"><div className="flex items-start justify-between gap-2"><div><p className="font-bold text-slate-950">{row.registration?.full_name??"Peserta tidak ditemukan"}</p><p className="mt-1 font-mono text-xs text-slate-500">{row.token}</p></div><CategoryPill kind={row.kind??row.registration?.kind??"umum"}/></div><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500"><span>{row.answers?.filter(Boolean).length??0}/5 jawaban</span><span className="font-bold text-violet-700">Lihat detail</span></div></button>)}</div>
      </>}
    </section>
    <Dialog open={!!selected} onOpenChange={open=>!open&&setSelected(null)}><DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-3xl"><DialogHeader><DialogTitle>Jawaban Studi Kasus</DialogTitle></DialogHeader>{selected&&<div className="space-y-4"><div className="rounded-2xl bg-slate-50 p-4"><p className="font-bold">{selected.registration?.full_name??"Peserta tidak ditemukan"}</p><p className="text-sm text-slate-500">{selected.token} · {selected.registration?.email}</p></div>{(selected.answers??[]).map((answer,index)=><article key={index} className="rounded-2xl border border-slate-200 p-4"><p className="text-[10px] font-black uppercase tracking-widest text-violet-600">Jawaban {index+1}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{answer||"Belum dijawab"}</p></article>)}</div>}</DialogContent></Dialog>
  </div>;
}
