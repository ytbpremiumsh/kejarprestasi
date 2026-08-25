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
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[oklch(0.17_0.13_285)] text-white shadow-[0_8px_30px_oklch(0.12_0.1_285/0.16)]">
      <div className="container-page flex h-[72px] items-center justify-between gap-6">
        <Link to="/" className="flex min-w-0 items-center" aria-label="Kejar Prestasi">
          <img src={headerLogo} alt="Logo Kejar Prestasi" className="h-10 w-auto max-w-[190px] object-contain" />
        </Link>

        <nav className="hidden lg:flex items-center gap-1" aria-label="Navigasi utama">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="group relative rounded-full px-4 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/8 hover:text-white"
              activeProps={{ className: "group relative rounded-full px-4 py-2.5 text-sm font-semibold text-white bg-white/8" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
              {n.to === "/" ? null : n.label === "Tentang Kami" ? null : null}
            </Link>
          ))}
          <button type="button" onClick={goToTimeline} className="group inline-flex items-center gap-1 rounded-full px-4 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/8 hover:text-white">
            Timeline <ChevronDown size={14} className="rotate-[-90deg] opacity-50" />
          </button>
        </nav>

        <div className="hidden lg:flex items-center gap-2.5">
          <button type="button" onClick={() => navigate({ to: "/cek-status" })} className="rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/8">
            Masuk
          </button>
          <button type="button" onClick={goToTimeline} className="rounded-full bg-[oklch(0.78_0.17_82)] px-5 py-2.5 text-sm font-bold text-[oklch(0.18_0.12_285)] shadow-[0_8px_24px_oklch(0.78_0.17_82/0.18)] transition hover:-translate-y-0.5 hover:brightness-105">
            Daftar Sekarang
          </button>
        </div>

        <button aria-label={open ? "Tutup menu" : "Buka menu"} aria-expanded={open} className="lg:hidden rounded-xl border border-white/15 bg-white/8 p-2.5 text-white" onClick={() => setOpen((v) => !v)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-white/10 bg-[oklch(0.15_0.12_285)]">
          <div className="container-page py-4">
            <nav className="flex flex-col gap-1" aria-label="Navigasi mobile">
              {nav.map((n) => (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/8 hover:text-white">
                  {n.label}
                </Link>
              ))}
              <button type="button" onClick={goToTimeline} className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium text-white/80 hover:bg-white/8 hover:text-white">
                Timeline <ChevronDown size={16} className="rotate-[-90deg] opacity-50" />
              </button>
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
                <button type="button" onClick={() => { setOpen(false); navigate({ to: "/cek-status" }); }} className="rounded-full border border-white/20 px-4 py-3 text-sm font-semibold text-white">Masuk</button>
                <button type="button" onClick={goToTimeline} className="rounded-full bg-[oklch(0.78_0.17_82)] px-4 py-3 text-sm font-bold text-[oklch(0.18_0.12_285)]">Daftar Sekarang</button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
