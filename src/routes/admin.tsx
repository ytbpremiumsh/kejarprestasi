import { createFileRoute, Outlet, useNavigate, Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, LogOut, Home, ShieldCheck, CircleUserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { isAdminDemo, stopAdminDemo } from "@/lib/admin-demo";

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
  const path = useRouterState({ select: (state) => state.location.pathname });
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const check = async () => {
      if (isAdminDemo()) {
        setEmail("demo@kejarprestasi.id");
        setIsAdmin(true);
        setChecking(false);
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        navigate({ to: "/login" });
        return;
      }
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.nextLevel === "aal2" && aal.currentLevel === "aal1") {
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
    stopAdminDemo();
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

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#f6f7fb]">
        <AdminSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/90 px-3 backdrop-blur-xl sm:px-5">
            <SidebarTrigger className="rounded-xl border border-slate-200 bg-white" />
            <div className="flex-1">
              <p className="text-sm font-black text-indigo-950">Admin Dashboard {isAdminDemo() && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-amber-700">Demo · Read Only</span>}</p>
              <p className="hidden truncate text-xs text-slate-500 sm:block">Kelola program dan proses seleksi dalam satu tempat</p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/" target="_blank" rel="noopener noreferrer">
                <Home className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Lihat Situs</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <CircleUserRound className="mr-1 hidden h-4 w-4 lg:block"/><span className="hidden lg:inline">{email}</span><LogOut className="h-4 w-4 lg:ml-2" /><span className="sr-only">Keluar</span>
            </Button>
          </header>
          <main className="px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
            {isAdminDemo() && path !== "/admin" ? <div className="mx-auto max-w-xl rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center"><ShieldCheck className="mx-auto h-10 w-10 text-amber-600"/><h2 className="mt-4 text-xl font-extrabold">Fitur terkunci dalam mode demo</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Mode demo hanya menampilkan ringkasan simulasi dan tidak dapat membuka atau mengubah data produksi.</p><Button asChild className="mt-5"><Link to="/admin">Kembali ke Ringkasan</Link></Button></div> : <Outlet />}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
