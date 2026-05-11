import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Loader2, GraduationCap, HeartHandshake, Clock, CheckCircle2, XCircle, FileText } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

type Stats = {
  total: number;
  prestasi: number;
  ekonomi: number;
  pending: number;
  approved: number;
  rejected: number;
  documents: number;
};

function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const load = async () => {
      const [allRes, docsRes] = await Promise.all([
        supabase.from("registrations").select("kind,status"),
        supabase.from("documents").select("id", { count: "exact", head: true }),
      ]);
      const rows = allRes.data ?? [];
      setStats({
        total: rows.length,
        prestasi: rows.filter((r) => r.kind === "prestasi").length,
        ekonomi: rows.filter((r) => r.kind === "ekonomi").length,
        pending: rows.filter((r) => r.status === "pending").length,
        approved: rows.filter((r) => r.status === "approved").length,
        rejected: rows.filter((r) => r.status === "rejected").length,
        documents: docsRes.count ?? 0,
      });
    };
    load();
  }, []);

  if (!stats) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const items = [
    { label: "Total Pendaftar", value: stats.total, icon: GraduationCap, color: "text-primary", bg: "bg-primary/10" },
    { label: "Beasiswa Prestasi", value: stats.prestasi, icon: GraduationCap, color: "text-primary", bg: "bg-primary/10" },
    { label: "Beasiswa Ekonomi", value: stats.ekonomi, icon: HeartHandshake, color: "text-accent-foreground", bg: "bg-accent/30" },
    { label: "Menunggu Verifikasi", value: stats.pending, icon: Clock, color: "text-yellow-700", bg: "bg-yellow-100" },
    { label: "Disetujui", value: stats.approved, icon: CheckCircle2, color: "text-green-700", bg: "bg-green-100" },
    { label: "Ditolak", value: stats.rejected, icon: XCircle, color: "text-red-700", bg: "bg-red-100" },
    { label: "Berkas Diunggah", value: stats.documents, icon: FileText, color: "text-blue-700", bg: "bg-blue-100" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Statistik Pendaftaran</h1>
        <p className="text-sm text-muted-foreground">Ringkasan program Beasiswa Kejar Prestasi Section #3.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map((it) => (
          <Card key={it.label} className="rounded-2xl p-5 shadow-soft">
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${it.bg} ${it.color}`}>
              <it.icon className="h-5 w-5" />
            </div>
            <p className="text-3xl font-bold text-foreground">{it.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{it.label}</p>
          </Card>
        ))}
      </div>
      <Card className="rounded-2xl p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-foreground">Aksi Cepat</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/admin/pendaftar" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Kelola Pendaftar
          </Link>
        </div>
      </Card>
    </div>
  );
}
