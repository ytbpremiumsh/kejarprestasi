import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, GraduationCap, HeartHandshake, Clock, FileText } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

type Stats = {
  total: number;
  prestasi: number;
  ekonomi: number;
  pending: number;
  documents: number;
};

type RecentReg = {
  id: string;
  full_name: string;
  email: string;
  kind: "prestasi" | "ekonomi";
  school_name: string;
  education_level: string;
  created_at: string;
};

function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<RecentReg[]>([]);

  useEffect(() => {
    const load = async () => {
      const [allRes, docsRes, recentRes] = await Promise.all([
        supabase.from("registrations").select("kind,status"),
        supabase.from("documents").select("id", { count: "exact", head: true }),
        supabase
          .from("registrations")
          .select("id,full_name,email,kind,school_name,education_level,created_at")
          .order("created_at", { ascending: false })
          .limit(8),
      ]);
      const rows = allRes.data ?? [];
      setStats({
        total: rows.length,
        prestasi: rows.filter((r) => r.kind === "prestasi").length,
        ekonomi: rows.filter((r) => r.kind === "ekonomi").length,
        pending: rows.filter((r) => r.status === "pending").length,
        documents: docsRes.count ?? 0,
      });
      setRecent((recentRes.data ?? []) as RecentReg[]);
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
    { label: "Berkas Diunggah", value: stats.documents, icon: FileText, color: "text-blue-700", bg: "bg-blue-100" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Statistik Pendaftaran</h1>
        <p className="text-sm text-muted-foreground">Ringkasan program Beasiswa Kejar Prestasi Section #3.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Pendaftar Beasiswa Terbaru</h2>
            <p className="text-xs text-muted-foreground">8 pendaftar paling baru.</p>
          </div>
          <Link to="/admin/pendaftar" className="text-sm font-medium text-primary hover:underline">
            Lihat semua
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Belum ada pendaftar.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Nama</th>
                  <th className="px-3 py-2">Kategori</th>
                  <th className="px-3 py-2">Sekolah / Kampus</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-3 py-2 font-medium text-foreground">{r.full_name}</td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className="capitalize">{r.kind}</Badge>
                    </td>
                    <td className="px-3 py-2">
                      <div>{r.school_name}</div>
                      <div className="text-xs uppercase text-muted-foreground">{r.education_level}</div>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{r.email}</td>
                    <td className="px-3 py-2 text-muted-foreground">{new Date(r.created_at).toLocaleDateString("id-ID")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
