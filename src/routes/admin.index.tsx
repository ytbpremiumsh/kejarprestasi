import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, GraduationCap, HeartHandshake, Clock, FileText, Bell, BellOff } from "lucide-react";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

type Row = {
  id: string;
  full_name: string;
  email: string;
  kind: "prestasi" | "ekonomi";
  status: "pending" | "approved" | "rejected";
  school_name: string;
  education_level: string;
  created_at: string;
};

const JENJANG = ["SD", "SMP", "SMA", "SMK", "MA", "Mahasiswa"] as const;
const COLORS = ["hsl(var(--primary))", "oklch(0.7 0.18 80)", "oklch(0.65 0.15 200)", "oklch(0.6 0.2 340)", "oklch(0.7 0.15 140)", "oklch(0.65 0.15 30)"];

function normalizeJenjang(v: string): string {
  const u = (v || "").toUpperCase();
  if (u.includes("MAHASISWA") || u.includes("KULIAH") || u.includes("UNIV")) return "Mahasiswa";
  if (u.includes("SMK")) return "SMK";
  if (u.includes("MA")) return "MA";
  if (u.includes("SMA")) return "SMA";
  if (u.includes("SMP") || u.includes("MTS")) return "SMP";
  if (u.includes("SD") || u.includes("MI")) return "SD";
  return v || "Lainnya";
}

function AdminOverview() {
  const [rows, setRows] = useState<Row[]>([]);
  const [docsCount, setDocsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("admin_notif_off") !== "1";
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const load = async () => {
    const [allRes, docsRes] = await Promise.all([
      supabase
        .from("registrations")
        .select("id,full_name,email,kind,status,school_name,education_level,created_at")
        .order("created_at", { ascending: false }),
      supabase.from("documents").select("id", { count: "exact", head: true }),
    ]);
    setRows((allRes.data ?? []) as Row[]);
    setDocsCount(docsRes.count ?? 0);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Realtime subscribe
  useEffect(() => {
    const channel = supabase
      .channel("admin-registrations")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "registrations" },
        (payload) => {
          const newRow = payload.new as Row;
          setRows((prev) => [newRow, ...prev]);
          if (notif) {
            toast.success(`Pendaftar baru: ${newRow.full_name}`, {
              description: `${newRow.kind === "prestasi" ? "Beasiswa Prestasi" : "Beasiswa Ekonomi"} · ${newRow.school_name}`,
              duration: 8000,
            });
            try { audioRef.current?.play().catch(() => {}); } catch { /* ignore */ }
            if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
              new Notification("Pendaftar baru", { body: `${newRow.full_name} — ${newRow.school_name}` });
            }
          }
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [notif]);

  const toggleNotif = async () => {
    const next = !notif;
    setNotif(next);
    localStorage.setItem("admin_notif_off", next ? "0" : "1");
    if (next && typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
    toast.message(next ? "Notifikasi diaktifkan" : "Notifikasi dimatikan");
  };

  const stats = useMemo(() => ({
    total: rows.length,
    prestasi: rows.filter((r) => r.kind === "prestasi").length,
    ekonomi: rows.filter((r) => r.kind === "ekonomi").length,
    pending: rows.filter((r) => r.status === "pending").length,
    today: rows.filter((r) => new Date(r.created_at).toDateString() === new Date().toDateString()).length,
  }), [rows]);

  const byJenjang = useMemo(() => {
    const map = new Map<string, { name: string; prestasi: number; ekonomi: number; total: number }>();
    for (const j of JENJANG) map.set(j, { name: j, prestasi: 0, ekonomi: 0, total: 0 });
    for (const r of rows) {
      const j = normalizeJenjang(r.education_level);
      const cur = map.get(j) ?? { name: j, prestasi: 0, ekonomi: 0, total: 0 };
      if (r.kind === "prestasi") cur.prestasi++; else cur.ekonomi++;
      cur.total++;
      map.set(j, cur);
    }
    return Array.from(map.values()).filter((x) => x.total > 0 || JENJANG.includes(x.name as typeof JENJANG[number]));
  }, [rows]);

  const byKind = useMemo(() => [
    { name: "Prestasi", value: stats.prestasi },
    { name: "Ekonomi", value: stats.ekonomi },
  ], [stats]);

  const last14 = useMemo(() => {
    const days: { date: string; label: string; count: number }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push({
        date: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
        count: 0,
      });
    }
    const idx = new Map(days.map((d, i) => [d.date, i]));
    for (const r of rows) {
      const k = new Date(r.created_at).toISOString().slice(0, 10);
      const i = idx.get(k);
      if (i !== undefined) days[i].count++;
    }
    return days;
  }, [rows]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const recent = rows.slice(0, 8);

  const items = [
    { label: "Total Pendaftar", value: stats.total, icon: GraduationCap, color: "text-primary", bg: "bg-primary/10" },
    { label: "Hari Ini", value: stats.today, icon: Clock, color: "text-emerald-700", bg: "bg-emerald-100" },
    { label: "Beasiswa Prestasi", value: stats.prestasi, icon: GraduationCap, color: "text-primary", bg: "bg-primary/10" },
    { label: "Beasiswa Ekonomi", value: stats.ekonomi, icon: HeartHandshake, color: "text-accent-foreground", bg: "bg-accent/30" },
    { label: "Berkas Diunggah", value: docsCount, icon: FileText, color: "text-blue-700", bg: "bg-blue-100" },
  ];

  return (
    <div className="space-y-6">
      {/* Notif sound (silent inline ping) */}
      <audio
        ref={audioRef}
        preload="auto"
        src="data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Statistik Pendaftaran</h1>
          <p className="text-sm text-muted-foreground">
            Update real-time · {stats.today} pendaftar hari ini
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={toggleNotif}>
          {notif ? <Bell className="h-4 w-4 mr-1.5" /> : <BellOff className="h-4 w-4 mr-1.5" />}
          {notif ? "Notifikasi: ON" : "Notifikasi: OFF"}
        </Button>
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

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl p-5 shadow-soft lg:col-span-2">
          <h2 className="text-base font-semibold text-foreground">Pendaftar per Hari (14 hari terakhir)</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last14}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} name="Pendaftar" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-2xl p-5 shadow-soft">
          <h2 className="text-base font-semibold text-foreground">Distribusi Kategori</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byKind} dataKey="value" nameKey="name" outerRadius={80} label>
                  {byKind.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="rounded-2xl p-5 shadow-soft">
        <h2 className="text-base font-semibold text-foreground">Pendaftar per Jenjang</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byJenjang}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="prestasi" stackId="a" fill="hsl(var(--primary))" name="Prestasi" radius={[0, 0, 0, 0]} />
              <Bar dataKey="ekonomi" stackId="a" fill="oklch(0.75 0.15 80)" name="Ekonomi" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

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
