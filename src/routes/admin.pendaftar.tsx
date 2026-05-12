import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Download, FileText, ExternalLink, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export const Route = createFileRoute("/admin/pendaftar")({
  component: AdminPendaftar,
});

type Registration = {
  id: string;
  full_name: string;
  nik: string;
  email: string;
  whatsapp: string;
  gender: string;
  birth_place: string;
  birth_date: string;
  address: string;
  education_level: string;
  school_name: string;
  grade: string;
  kind: "prestasi" | "ekonomi";
  status: "pending" | "approved" | "rejected";
  parent_income: string | null;
  dependents: number | null;
  main_achievement: string | null;
  photo_url: string | null;
  student_card_url: string | null;
  created_at: string;
};

type Document = {
  id: string;
  registration_id: string | null;
  email: string;
  doc_type: string;
  file_url: string;
  kind: string;
  created_at: string;
};

function AdminPendaftar() {
  const [rows, setRows] = useState<Registration[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filterKind, setFilterKind] = useState<"all" | "prestasi" | "ekonomi">("all");
  
  const [selected, setSelected] = useState<Registration | null>(null);

  const load = async () => {
    setLoading(true);
    const [r, d] = await Promise.all([
      supabase.from("registrations").select("*").order("created_at", { ascending: false }),
      supabase.from("documents").select("*").order("created_at", { ascending: false }),
    ]);
    if (r.error) toast.error(r.error.message);
    setRows((r.data ?? []) as Registration[]);
    setDocs((d.data ?? []) as Document[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filterKind !== "all" && r.kind !== filterKind) return false;
      
      if (q) {
        const s = q.toLowerCase();
        return (
          r.full_name.toLowerCase().includes(s) ||
          r.email.toLowerCase().includes(s) ||
          r.nik.includes(s) ||
          r.school_name.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [rows, q, filterKind]);


  const exportExcel = () => {
    const data = filtered.map((r) => ({
      "Nama Lengkap": r.full_name,
      NIK: r.nik,
      Email: r.email,
      WhatsApp: r.whatsapp,
      "Jenis Kelamin": r.gender,
      "Tempat Lahir": r.birth_place,
      "Tanggal Lahir": r.birth_date,
      Alamat: r.address,
      "Jenjang": r.education_level,
      Sekolah: r.school_name,
      Kelas: r.grade,
      Kategori: r.kind,
      Status: r.status,
      "Penghasilan Ortu": r.parent_income ?? "",
      Tanggungan: r.dependents ?? "",
      Prestasi: r.main_achievement ?? "",
      "Tanggal Daftar": new Date(r.created_at).toLocaleString("id-ID"),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pendaftar");
    XLSX.writeFile(wb, `pendaftar-beasiswa-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const docsForRow = (r: Registration) =>
    docs.filter((d) => d.registration_id === r.id || d.email === r.email);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pendaftar</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} dari {rows.length} pendaftar</p>
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
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama, email, NIK, sekolah..." className="pl-9" />
          </div>
          <select value={filterKind} onChange={(e) => setFilterKind(e.target.value as "all" | "prestasi" | "ekonomi")} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="all">Semua Kategori</option>
            <option value="prestasi">Prestasi</option>
            <option value="ekonomi">Ekonomi</option>
          </select>
        </div>
      </Card>

      <Card className="rounded-2xl shadow-soft overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">Belum ada pendaftar.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Sekolah</th>
                  <th className="px-4 py-3">Kontak</th>
                  <th className="px-4 py-3">Berkas</th>
                  
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{r.full_name}</div>
                      <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("id-ID")}</div>
                    </td>
                    <td className="px-4 py-3 capitalize">{r.kind}</td>
                    <td className="px-4 py-3">
                      <div>{r.school_name}</div>
                      <div className="text-xs text-muted-foreground uppercase">{r.education_level} · {r.grade}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{r.email}</div>
                      <div className="text-xs text-muted-foreground">{r.whatsapp}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{docsForRow(r).length} file</Badge>
                    </td>
                    
                    <td className="px-4 py-3">
                      <Button size="sm" variant="outline" onClick={() => setSelected(r)}>Detail</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selected && (
        <DetailDialog
          row={selected}
          docs={docsForRow(selected)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Registration["status"] }) {
  const map = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${map[status]}`}>{status}</span>;
}

function DetailDialog({
  row, docs, onClose,
}: {
  row: Registration;
  docs: Document[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-background p-6 shadow-soft" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">{row.full_name}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="capitalize">{row.kind}</Badge>
              <StatusBadge status={row.status} />
              <span className="text-xs text-muted-foreground">Daftar {new Date(row.created_at).toLocaleString("id-ID")}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>Tutup</Button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 text-sm">
          <Field label="NIK" value={row.nik} />
          <Field label="Email" value={row.email} />
          <Field label="WhatsApp" value={row.whatsapp} />
          <Field label="Jenis Kelamin" value={row.gender} />
          <Field label="Tempat / Tanggal Lahir" value={`${row.birth_place}, ${row.birth_date}`} />
          <Field label="Jenjang" value={`${row.education_level} · ${row.grade}`} />
          <Field label="Sekolah / Kampus" value={row.school_name} />
          <Field label="Alamat" value={row.address} />
          {row.parent_income && <Field label="Penghasilan Ortu" value={row.parent_income} />}
          {row.dependents != null && <Field label="Tanggungan" value={String(row.dependents)} />}
          {row.main_achievement && <Field label="Prestasi Utama" value={row.main_achievement} />}
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-foreground mb-2">Berkas ({docs.length + (row.photo_url ? 1 : 0) + (row.student_card_url ? 1 : 0)})</h3>
          <div className="space-y-2">
            {row.photo_url && <DocLink type="Foto" url={row.photo_url} />}
            {row.student_card_url && <DocLink type="Kartu Pelajar / KTP" url={row.student_card_url} />}
            {docs.map((d) => <DocLink key={d.id} type={d.doc_type} url={d.file_url} />)}
            {docs.length === 0 && !row.photo_url && !row.student_card_url && (
              <p className="text-sm text-muted-foreground">Belum ada berkas.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-foreground">{value}</p>
    </div>
  );
}

function DocLink({ type, url }: { type: string; url: string }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 hover:bg-muted">
      <div className="flex items-center gap-2 text-sm">
        <FileText className="h-4 w-4 text-primary" />
        <span className="font-medium">{type}</span>
      </div>
      <ExternalLink className="h-4 w-4 text-muted-foreground" />
    </a>
  );
}
