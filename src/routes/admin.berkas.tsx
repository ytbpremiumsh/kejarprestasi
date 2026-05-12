import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, Download, FileText, ExternalLink, RotateCcw, Trash2, User, Check, X, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export const Route = createFileRoute("/admin/berkas")({
  component: AdminBerkas,
});

type CandidateStatus = "pending" | "approved" | "rejected";

type Document = {
  id: string;
  registration_id: string | null;
  email: string;
  doc_type: string;
  file_url: string;
  kind: string;
  created_at: string;
};

type Registration = {
  id: string;
  full_name: string;
  email: string;
  whatsapp: string;
  gender: string;
  birth_place: string;
  birth_date: string;
  address: string;
  education_level: string;
  school_name: string;
  grade: string;
  kind: string;
  candidate_status: CandidateStatus;
};

function AdminBerkas() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [regs, setRegs] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filterKind, setFilterKind] = useState<"all" | "prestasi" | "ekonomi">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | CandidateStatus>("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const load = async () => {
    setLoading(true);
    const [d, r] = await Promise.all([
      supabase.from("documents").select("*").order("created_at", { ascending: false }),
      supabase.from("registrations").select("id, full_name, email, whatsapp, gender, birth_place, birth_date, address, education_level, school_name, grade, kind, candidate_status"),
    ]);
    if (d.error) toast.error(d.error.message);
    if (r.error) toast.error(r.error.message);
    setDocs((d.data ?? []) as Document[]);
    setRegs((r.data ?? []) as Registration[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const findReg = (doc: Pick<Document, "registration_id" | "email" | "kind">): Registration | undefined => {
    if (doc.registration_id) {
      const byId = regs.find((r) => r.id === doc.registration_id);
      if (byId) return byId;
    }
    return regs.find((r) => r.email.toLowerCase() === doc.email.toLowerCase() && r.kind === doc.kind);
  };

  const grouped = useMemo(() => {
    const map = new Map<string, Document[]>();
    for (const d of docs) {
      const key = `${d.email.toLowerCase()}__${d.kind}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    }
    let rows = Array.from(map.entries()).map(([key, items]) => {
      const reg = findReg(items[0]);
      return {
        key,
        reg,
        email: items[0].email,
        kind: items[0].kind,
        items,
        latest: items[0]?.created_at,
        status: (reg?.candidate_status ?? "pending") as CandidateStatus,
      };
    });
    if (filterKind !== "all") rows = rows.filter((r) => r.kind === filterKind);
    if (filterStatus !== "all") rows = rows.filter((r) => r.status === filterStatus);
    if (q) {
      const s = q.toLowerCase();
      rows = rows.filter((r) =>
        r.email.toLowerCase().includes(s) ||
        (r.reg?.full_name.toLowerCase().includes(s) ?? false) ||
        (r.reg?.school_name.toLowerCase().includes(s) ?? false) ||
        r.items.some((i) => i.doc_type.toLowerCase().includes(s)),
      );
    }
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docs, regs, filterKind, filterStatus, q]);

  const exportExcel = () => {
    const data = docs.map((d) => {
      const r = findReg(d);
      return {
        "Nama Lengkap": r?.full_name ?? "",
        Email: d.email,
        WhatsApp: r?.whatsapp ?? "",
        "Jenis Kelamin": r?.gender ?? "",
        "Tempat Lahir": r?.birth_place ?? "",
        "Tanggal Lahir": r?.birth_date ?? "",
        Alamat: r?.address ?? "",
        Jenjang: r?.education_level ?? "",
        Sekolah: r?.school_name ?? "",
        Kelas: r?.grade ?? "",
        Kategori: d.kind,
        "Jenis Berkas": d.doc_type,
        "Status Kandidat": r?.candidate_status ?? "pending",
        "Link File": d.file_url,
        "Tanggal Kirim": new Date(d.created_at).toLocaleString("id-ID"),
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Berkas");
    XLSX.writeFile(wb, `pengiriman-berkas-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const updateCandidate = async (regId: string | undefined, status: CandidateStatus, fallback?: { email: string; kind: string }) => {
    let id = regId;
    if (!id && fallback) {
      const r = regs.find((x) => x.email.toLowerCase() === fallback.email.toLowerCase() && x.kind === fallback.kind);
      id = r?.id;
    }
    if (!id) return toast.error("Pendaftar tidak ditemukan di database");
    const { error } = await supabase
      .from("registrations")
      .update({ candidate_status: status, candidate_reviewed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(
      status === "approved" ? "Disetujui & dipindah ke halaman Kandidat" :
      status === "rejected" ? "Pendaftar ditolak" : "Status direset",
    );
    setRegs((prev) => prev.map((r) => (r.id === id ? { ...r, candidate_status: status } : r)));
  };

  const removeDoc = async (id: string) => {
    if (!confirm("Hapus berkas ini?")) return;
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Berkas dihapus");
    setDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const statusBadge = (s: CandidateStatus) => {
    if (s === "approved") return <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/20">✓ Kandidat</Badge>;
    if (s === "rejected") return <Badge className="bg-red-500/15 text-red-700 border-red-500/30 hover:bg-red-500/20">✕ Ditolak</Badge>;
    return <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/30 hover:bg-amber-500/20">⏳ Menunggu</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pengiriman Berkas</h1>
          <p className="text-sm text-muted-foreground">{grouped.length} pengirim · {docs.length} berkas total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load}><RotateCcw className="h-4 w-4 mr-1" />Refresh</Button>
          <Button onClick={exportExcel}><Download className="h-4 w-4 mr-1" />Export Excel</Button>
        </div>
      </div>

      <Card className="rounded-2xl p-4 shadow-soft">
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama, email, sekolah, atau jenis berkas..." className="pl-9" />
          </div>
          <select value={filterKind} onChange={(e) => setFilterKind(e.target.value as "all" | "prestasi" | "ekonomi")} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="all">Semua Kategori</option>
            <option value="prestasi">Prestasi</option>
            <option value="ekonomi">Ekonomi</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as "all" | CandidateStatus)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu Review</option>
            <option value="approved">Disetujui (Kandidat)</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>
      </Card>

      {loading ? (
        <Card className="rounded-2xl p-16 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></Card>
      ) : grouped.length === 0 ? (
        <Card className="rounded-2xl p-16 text-center text-sm text-muted-foreground">Belum ada berkas terkirim.</Card>
      ) : (
        <Card className="rounded-2xl overflow-hidden shadow-soft">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-8"></TableHead>
                <TableHead>NAMA</TableHead>
                <TableHead>KATEGORI</TableHead>
                <TableHead>SEKOLAH</TableHead>
                <TableHead>KONTAK</TableHead>
                <TableHead>BERKAS</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead className="text-right">AKSI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grouped.map((g) => {
                const isOpen = !!expanded[g.key];
                return (
                  <Fragment key={g.key}>
                    <TableRow className="align-top">
                      <TableCell>
                        <button onClick={() => setExpanded((p) => ({ ...p, [g.key]: !p[g.key] }))} className="text-muted-foreground hover:text-foreground">
                          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 font-medium">
                          <User className="h-4 w-4 text-primary shrink-0" />
                          {g.reg?.full_name ?? <span className="text-muted-foreground italic">Tidak terdaftar</span>}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{g.email}</div>
                      </TableCell>
                      <TableCell><Badge variant="secondary" className="capitalize">{g.kind}</Badge></TableCell>
                      <TableCell className="text-sm">
                        {g.reg ? (
                          <>
                            <div>{g.reg.school_name || "-"}</div>
                            <div className="text-xs text-muted-foreground">{g.reg.education_level} {g.reg.grade && `· ${g.reg.grade}`}</div>
                          </>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {g.reg?.whatsapp ? <div>{g.reg.whatsapp}</div> : <div className="text-muted-foreground">-</div>}
                        <div className="text-xs text-muted-foreground">{new Date(g.latest).toLocaleDateString("id-ID")}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{g.items.length} file</Badge>
                      </TableCell>
                      <TableCell>{statusBadge(g.status)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="outline" disabled={!g.reg || g.status === "approved"} onClick={() => updateCandidate(g.reg?.id, "approved", { email: g.email, kind: g.kind })} className="h-8 border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10">
                            <Check className="h-3.5 w-3.5 mr-1" />Setujui
                          </Button>
                          <Button size="sm" variant="outline" disabled={!g.reg || g.status === "rejected"} onClick={() => updateCandidate(g.reg?.id, "rejected", { email: g.email, kind: g.kind })} className="h-8 border-red-500/40 text-red-700 hover:bg-red-500/10">
                            <X className="h-3.5 w-3.5 mr-1" />Tolak
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {isOpen && (
                      <TableRow className="bg-muted/20 hover:bg-muted/20">
                        <TableCell></TableCell>
                        <TableCell colSpan={7} className="py-3">
                          {g.reg && (
                            <div className="mb-3 grid grid-cols-1 gap-x-4 gap-y-1 rounded-lg border border-border bg-background p-3 text-xs sm:grid-cols-2">
                              <Info label="Jenis Kelamin" value={g.reg.gender} />
                              <Info label="Tempat / Tgl Lahir" value={`${g.reg.birth_place}, ${g.reg.birth_date}`} />
                              <Info label="Alamat" value={g.reg.address} className="sm:col-span-2" />
                            </div>
                          )}
                          <div className="grid gap-2">
                            {g.items.map((d) => (
                              <div key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2">
                                <a href={d.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm flex-1 min-w-0">
                                  <FileText className="h-4 w-4 text-primary shrink-0" />
                                  <span className="font-medium truncate">{d.doc_type}</span>
                                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                </a>
                                <Button size="icon" variant="ghost" title="Hapus" onClick={() => removeDoc(d.id)} className="h-8 w-8 text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

function Info({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <span className="text-muted-foreground">{label}: </span>
      <span className="text-foreground">{value || "-"}</span>
    </div>
  );
}
