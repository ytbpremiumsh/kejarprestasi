import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { useBranding } from "@/hooks/use-branding";

const nav = [
  { to: "/", label: "Beranda" },
  { to: "/artikel", label: "Artikel" },
  { to: "/tentang", label: "Tentang Kami" },
  { to: "/cek-status", label: "Cek Status" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { headerLogo } = useBranding();

  const goToTimeline = async () => {
    setOpen(false);
    if (window.location.pathname !== "/") await navigate({ to: "/" });
    setTimeout(() => document.getElementById("timeline")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/95 text-foreground shadow-[0_4px_20px_oklch(0.15_0.05_285/0.06)] backdrop-blur-xl">
      <div className="container-page flex h-[72px] items-center justify-between gap-6">
        <Link to="/" className="flex min-w-0 items-center" aria-label="Kejar Prestasi">
          <img src={headerLogo} alt="Logo Kejar Prestasi" className="h-10 w-auto max-w-[190px] object-contain" />
        </Link>

        <nav className="hidden lg:flex items-center gap-1" aria-label="Navigasi utama">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="group relative rounded-full px-4 py-2.5 text-sm font-medium text-foreground/65 transition hover:bg-secondary hover:text-primary"
              activeProps={{ className: "group relative rounded-full px-4 py-2.5 text-sm font-semibold text-primary bg-primary-soft" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
          <button type="button" onClick={goToTimeline} className="group inline-flex items-center gap-1 rounded-full px-4 py-2.5 text-sm font-medium text-foreground/65 transition hover:bg-secondary hover:text-primary">
            Timeline <ChevronDown size={14} className="rotate-[-90deg] opacity-50" />
          </button>
        </nav>

        <div className="hidden lg:flex items-center gap-2.5">
          <button type="button" onClick={() => navigate({ to: "/cek-status" })} className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:bg-secondary hover:text-primary">
            Masuk
          </button>
          <button type="button" onClick={goToTimeline} className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-soft transition hover:-translate-y-0.5 hover:opacity-95">
            Daftar Sekarang
          </button>
        </div>

        <button aria-label={open ? "Tutup menu" : "Buka menu"} aria-expanded={open} className="lg:hidden rounded-xl border border-border bg-background p-2.5 text-foreground shadow-card" onClick={() => setOpen((v) => !v)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="container-page py-4">
            <nav className="flex flex-col gap-1" aria-label="Navigasi mobile">
              {nav.map((n) => (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium text-foreground/80 hover:bg-secondary hover:text-primary">
                  {n.label}
                </Link>
              ))}
              <button type="button" onClick={goToTimeline} className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium text-foreground/80 hover:bg-secondary hover:text-primary">
                Timeline <ChevronDown size={16} className="rotate-[-90deg] opacity-50" />
              </button>
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border pt-3">
                <button type="button" onClick={() => { setOpen(false); navigate({ to: "/cek-status" }); }} className="rounded-full border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground">Masuk</button>
                <button type="button" onClick={goToTimeline} className="rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">Daftar Sekarang</button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
