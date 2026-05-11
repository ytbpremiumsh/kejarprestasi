import { createFileRoute, Outlet, useNavigate, Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, LogOut, LayoutDashboard, Users, Settings, Megaphone, FileEdit, FileText, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Beasiswa Kejar Prestasi" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    let active = true;
    const check = async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        navigate({ to: "/login" });
        return;
      }
      setEmail(sess.session.user.email ?? null);
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", sess.session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!active) return;
      if (error || !data) {
        setIsAdmin(false);
      } else {
        setIsAdmin(true);
      }
      setChecking(false);
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate({ to: "/login" });
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  const logout = async () => {
    await supabase.auth.signOut();
    toast.success("Anda telah keluar");
    navigate({ to: "/login" });
  };

  if (checking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground">Akses Ditolak</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Akun <span className="font-medium">{email}</span> belum memiliki role admin.
          Hubungi administrator utama untuk diberikan akses.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="outline" onClick={logout}>Keluar</Button>
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Beranda</Link>
        </div>
      </div>
    );
  }

  const isOverview = path === "/admin";

  return (
    <div className="bg-muted/20 min-h-[80vh]">
      <div className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Admin Dashboard</p>
              <p className="text-xs text-muted-foreground">{email}</p>
            </div>
          </div>
          <nav className="flex items-center gap-1">
            <Link
              to="/admin"
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${isOverview ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
            >
              Overview
            </Link>
            <Link
              to="/admin/pendaftar"
              className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium ${path.startsWith("/admin/pendaftar") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
            >
              <Users className="h-4 w-4" />
              Pendaftar
            </Link>
            <Link
              to="/admin/artikel"
              className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium ${path.startsWith("/admin/artikel") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
            >
              <FileText className="h-4 w-4" />
              Artikel
            </Link>
            <Link
              to="/admin/formulir"
              className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium ${path.startsWith("/admin/formulir") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
            >
              <FileEdit className="h-4 w-4" />
              Formulir
            </Link>
            <Link
              to="/admin/pengaturan"
              className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium ${path.startsWith("/admin/pengaturan") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
            >
              <Settings className="h-4 w-4" />
              Pengaturan
            </Link>
            <Link
              to="/admin/adsense"
              className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium ${path.startsWith("/admin/adsense") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
            >
              <Megaphone className="h-4 w-4" />
              AdSense
            </Link>
            <Link
              to="/admin/kode-kustom"
              className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium ${path.startsWith("/admin/kode-kustom") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
            >
              <Code2 className="h-4 w-4" />
              Kode &amp; Performa
            </Link>
            <Button variant="ghost" size="sm" onClick={logout} className="ml-2">
              <LogOut className="h-4 w-4 mr-1" /> Keluar
            </Button>
          </nav>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </div>
    </div>
  );
}
