import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Search } from "lucide-react";
import { useBranding } from "@/hooks/use-branding";

const nav = [
  { to: "/", label: "Beranda" },
  { to: "/beasiswa-prestasi", label: "Program Prestasi" },
  { to: "/beasiswa-ekonomi", label: "Program Ekonomi" },
  { to: "/artikel", label: "Wawasan" },
  { to: "/tentang", label: "Tentang Kami" },
] as const;

export function SiteHeader() {
  const [open,setOpen]=useState(false);
  const {headerLogo}=useBranding();
  return <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl">
    <div className="container-page py-3 md:py-4">
      <div className="flex min-h-[62px] items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card px-4 shadow-sm md:px-6">
        <Link to="/" aria-label="Kejar Prestasi" className="flex shrink-0 items-center"><img src={headerLogo} alt="Kejar Prestasi" className="h-9 w-auto max-w-[165px] object-contain md:h-10 md:max-w-[190px]"/></Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">{nav.map(item=><Link key={item.to} to={item.to} activeOptions={{exact:item.to==="/"}} className="relative px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground" activeProps={{className:"relative px-3 py-2 text-sm font-extrabold text-primary after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-primary"}}>{item.label}</Link>)}</nav>
        <div className="hidden items-center lg:flex"><Link to="/cek-status" className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-bold transition hover:border-primary/30 hover:text-primary"><Search size={15}/> Cek Pendaftaran</Link></div>
        <button type="button" aria-label={open?"Tutup menu":"Buka menu"} onClick={()=>setOpen(!open)} className="grid h-10 w-10 place-items-center rounded-xl border border-border lg:hidden">{open?<X size={19}/>:<Menu size={19}/>}</button>
      </div>
      {open&&<div className="mt-2 rounded-2xl border border-border bg-card p-3 shadow-card lg:hidden"><nav className="grid gap-1">{nav.map(item=><Link key={item.to} to={item.to} onClick={()=>setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-foreground/80 hover:bg-secondary hover:text-primary">{item.label}</Link>)}<Link to="/cek-status" onClick={()=>setOpen(false)} className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-bold"><Search size={15}/> Cek Pendaftaran</Link></nav></div>}
    </div>
  </header>;
}
