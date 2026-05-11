import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Download, FileText, ExternalLink, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export const Route = createFileRoute("/admin/berkas")({
  component: AdminBerkas,
});

type Document = {
  id: string;
  registration_id: string | null;
  email: string;
  doc_type: string;
  file_url: string;
  kind: string;
  created_at: string;
};

function AdminBerkas() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filterKind, setFilterKind] = useState<"all" | "prestasi" | "ekonomi">("all");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setDocs((data ?? []) as Document[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return docs.filter((d) => {
      if (filterKind !== "all" && d.kind !== filterKind) return false;
      if (q) {
        const s = q.toLowerCase();
        return d.email.toLowerCase().includes(s) || d.doc_type.toLowerCase().includes(s);
      }
      return true;
    });
  }, [docs, q, filterKind]);

  const grouped = useMemo(() => {
    const map = new Map<string, Document[]>();
    for (const d of filtered) {
      const key = `${d.email}__${d.kind}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    }
    return Array.from(map.entries()).map(([key, items]) => ({
      email: key.split("__")[0],
      kind: key.split("__")[1],
      items,
      latest: items[0]?.created_at,
    }));
  }, [filtered]);

  const exportExcel = () => {
    const data = filtered.map((d) => ({
      Email: d.email,
      Kategori: d.kind,
      "Jenis Berkas": d.doc_type,
      "Link File": d.file_url,
      "Tanggal Kirim": new Date(d.created_at).toLocaleString("id-ID"),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Berkas");
    XLSX.writeFile(wb, `pengiriman-berkas-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const removeDoc = async (id: string) => {
    if (!confirm("Hapus berkas ini?")) return;
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Berkas dihapus");
    setDocs((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pengiriman Berkas</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} dari {docs.length} berkas · {grouped.length} pengirim</p>
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
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari email atau jenis berkas..." className="pl-9" />
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
      ) : grouped.length === 0 ? (
        <Card className="rounded-2xl p-16 text-center text-sm text-muted-foreground">Belum ada berkas terkirim.</Card>
      ) : (
        <div className="grid gap-3">
          {grouped.map((g) => (
            <Card key={`${g.email}-${g.kind}`} className="rounded-2xl p-4 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <div className="font-semibold text-foreground">{g.email}</div>
                  <div className="text-xs text-muted-foreground">
                    Terakhir: {g.latest ? new Date(g.latest).toLocaleString("id-ID") : "-"}
                  </div>
                </div>
                <Badge variant="secondary" className="capitalize">{g.kind} · {g.items.length} file</Badge>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {g.items.map((d) => (
                  <div key={d.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
                    <a href={d.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm flex-1 min-w-0">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-medium truncate">{d.doc_type}</span>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </a>
                    <Button size="icon" variant="ghost" onClick={() => removeDoc(d.id)} className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
