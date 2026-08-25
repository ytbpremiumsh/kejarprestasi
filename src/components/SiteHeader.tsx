import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useBranding } from "@/hooks/use-branding";

const nav = [
  { to: "/", label: "Beranda" },
  { to: "/beasiswa-prestasi", label: "Prestasi" },
  { to: "/beasiswa-ekonomi", label: "Ekonomi" },
  { to: "/artikel", label: "Artikel" },
  { to: "/tentang", label: "Tentang" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { headerLogo } = useBranding();

  return <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
    <div className="container-page flex h-[70px] items-center justify-between gap-5 md:h-[78px]">
      <Link to="/" aria-label="Kejar Prestasi" className="flex shrink-0 items-center"><img src={headerLogo} alt="Kejar Prestasi" className="h-9 w-auto max-w-[170px] object-contain md:h-10 md:max-w-[190px]" /></Link>
      <nav className="hidden items-center rounded-full border border-border/80 bg-secondary/45 p-1 lg:flex" aria-label="Navigasi utama">
        {nav.map((item) => <Link key={item.to} to={item.to} activeOptions={{ exact: item.to === "/" }} className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-background hover:text-foreground" activeProps={{ className: "rounded-full bg-background px-4 py-2 text-sm font-bold text-primary shadow-sm" }}>{item.label}</Link>)}
      </nav>
      <div className="hidden items-center gap-2 lg:flex">
        <Link to="/cek-status" className="px-4 py-2 text-sm font-semibold text-foreground/75 transition hover:text-primary">Cek Status</Link>
        <button type="button" onClick={() => navigate({ to: "/daftar" })} className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-bold text-background transition hover:-translate-y-0.5">Pilih Beasiswa <ArrowUpRight size={16} /></button>
      </div>
      <button type="button" aria-label={open ? "Tutup menu" : "Buka menu"} aria-expanded={open} onClick={() => setOpen(!open)} className="grid h-11 w-11 place-items-center rounded-full border border-border bg-background text-foreground lg:hidden">{open ? <X size={20} /> : <Menu size={20} />}</button>
    </div>
    {open && <div className="border-t border-border bg-background lg:hidden"><div className="container-page py-4"><nav className="grid gap-1">{nav.map((item) => <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3.5 text-sm font-semibold text-foreground/80 transition hover:bg-secondary hover:text-primary">{item.label}</Link>)}<div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-4"><Link to="/cek-status" onClick={() => setOpen(false)} className="rounded-full border border-border px-4 py-3 text-center text-sm font-semibold">Cek Status</Link><Link to="/daftar" onClick={() => setOpen(false)} className="rounded-full bg-foreground px-4 py-3 text-center text-sm font-bold text-background">Pilih Beasiswa</Link></div></nav></div></div>}
  </header>;
}
