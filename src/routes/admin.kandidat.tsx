import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, Download, RotateCcw, Trophy, RotateCw, X, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export const Route = createFileRoute("/admin/kandidat")({
  component: AdminKandidat,
});

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
  candidate_status: "pending" | "approved" | "rejected";
  candidate_reviewed_at: string | null;
};

type Document = {
  id: string;
  registration_id: string | null;
  email: string;
  doc_type: string;
  file_url: string;
  kind: string;
};

function AdminKandidat() {
  const [regs, setRegs] = useState<Registration[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filterKind, setFilterKind] = useState<"all" | "prestasi" | "ekonomi">("all");

  const load = async () => {
    setLoading(true);
    const [r, d] = await Promise.all([
      supabase
        .from("registrations")
        .select("id, full_name, email, whatsapp, gender, birth_place, birth_date, address, education_level, school_name, grade, kind, candidate_status, candidate_reviewed_at")
        .eq("candidate_status", "approved")
        .order("candidate_reviewed_at", { ascending: false }),
      supabase.from("documents").select("id, registration_id, email, doc_type, file_url, kind"),
    ]);
    if (r.error) toast.error(r.error.message);
    if (d.error) toast.error(d.error.message);
    setRegs((r.data ?? []) as Registration[]);
    setDocs((d.data ?? []) as Document[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const docsFor = (reg: Registration) =>
    docs.filter(
      (x) =>
        x.registration_id === reg.id ||
        (x.email.toLowerCase() === reg.email.toLowerCase() && x.kind === reg.kind),
    );

  const filtered = useMemo(() => {
    return regs.filter((r) => {
      if (filterKind !== "all" && r.kind !== filterKind) return false;
      if (q) {
        const s = q.toLowerCase();
        return (
          r.full_name.toLowerCase().includes(s) ||
          r.email.toLowerCase().includes(s) ||
          (r.school_name?.toLowerCase().includes(s) ?? false)
        );
      }
      return true;
    });
  }, [regs, q, filterKind]);

  const setStatus = async (id: string, status: "pending" | "rejected") => {
    const { error } = await supabase
      .from("registrations")
      .update({ candidate_status: status, candidate_reviewed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(status === "pending" ? "Dikembalikan ke review" : "Dipindahkan ke daftar ditolak");
    setRegs((prev) => prev.filter((r) => r.id !== id));
  };

  const exportExcel = () => {
    const data = filtered.map((r) => ({
      "Nama Lengkap": r.full_name,
      Email: r.email,
      WhatsApp: r.whatsapp,
      "Jenis Kelamin": r.gender,
      "Tempat Lahir": r.birth_place,
      "Tanggal Lahir": r.birth_date,
      Alamat: r.address,
      Jenjang: r.education_level,
      Sekolah: r.school_name,
      Kelas: r.grade,
      Kategori: r.kind,
      "Disetujui Pada": r.candidate_reviewed_at ? new Date(r.candidate_reviewed_at).toLocaleString("id-ID") : "",
      "Jumlah Berkas": docsFor(r).length,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Kandidat");
    XLSX.writeFile(wb, `kandidat-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" /> Kandidat Lolos Berkas
          </h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} kandidat disetujui · siap untuk tahap berikutnya
          </p>
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
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama, email, atau sekolah..." className="pl-9" />
          </div>
          <select value={filterKind} onChange={(e) => setFilterKind(e.target.value as "all" | "prestasi" | "ekonomi")} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="all">Semua Kategori</option>
            <option value="prestasi">Prestasi</option>
            <option value="ekonomi">Ekonomi</option>
          </select>
        </div>
      </Card>

      {loading ? (
        <Card className="rounded-2xl p-16 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></Card>
      ) : filtered.length === 0 ? (
        <Card className="rounded-2xl p-16 text-center text-sm text-muted-foreground">
          Belum ada kandidat. Setujui pendaftar dari halaman Pengiriman Berkas.
        </Card>
      ) : (
        <Card className="rounded-2xl overflow-hidden shadow-soft">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>NAMA</TableHead>
                <TableHead>KATEGORI</TableHead>
                <TableHead>SEKOLAH</TableHead>
                <TableHead>KONTAK</TableHead>
                <TableHead>BERKAS</TableHead>
                <TableHead>DISETUJUI</TableHead>
                <TableHead className="text-right">AKSI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => {
                const files = docsFor(r);
                return (
                  <TableRow key={r.id} className="align-top">
                    <TableCell>
                      <div className="font-medium">{r.full_name}</div>
                      <div className="text-xs text-muted-foreground">{r.email}</div>
                      <div className="text-xs text-muted-foreground">{r.gender} · {r.birth_place}, {r.birth_date}</div>
                    </TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize">{r.kind}</Badge></TableCell>
                    <TableCell className="text-sm">
                      <div>{r.school_name || "-"}</div>
                      <div className="text-xs text-muted-foreground">{r.education_level} {r.grade && `· ${r.grade}`}</div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>{r.whatsapp}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">{r.address}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {files.length === 0 && <span className="text-xs text-muted-foreground">-</span>}
                        {files.slice(0, 3).map((f) => (
                          <a key={f.id} href={f.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                            <FileText className="h-3 w-3" />
                            <span className="truncate max-w-[160px]">{f.doc_type}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ))}
                        {files.length > 3 && <span className="text-xs text-muted-foreground">+{files.length - 3} lagi</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.candidate_reviewed_at ? new Date(r.candidate_reviewed_at).toLocaleDateString("id-ID") : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "pending")} className="h-8" title="Kembalikan ke review">
                          <RotateCw className="h-3.5 w-3.5 mr-1" />Reset
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "rejected")} className="h-8 border-red-500/40 text-red-700 hover:bg-red-500/10">
                          <X className="h-3.5 w-3.5 mr-1" />Tolak
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
