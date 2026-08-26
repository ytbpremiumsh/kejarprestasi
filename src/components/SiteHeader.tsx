import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, GraduationCap, Menu, X, Search, Trophy, HeartHandshake } from "lucide-react";
import { useBranding } from "@/hooks/use-branding";

export function SiteHeader(){
  const [open,setOpen]=useState(false);
  const [programOpen,setProgramOpen]=useState(false);
  const [desktopProgramOpen,setDesktopProgramOpen]=useState(false);
  const programRef=useRef<HTMLDivElement>(null);
  const {headerLogo}=useBranding();

  useEffect(()=>{
    const close=(e:MouseEvent)=>{
      if(programRef.current&&!programRef.current.contains(e.target as Node)) setDesktopProgramOpen(false);
    };
    document.addEventListener("mousedown",close);
    return()=>document.removeEventListener("mousedown",close);
  },[]);

  return <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl">
    <div className="container-page py-3 md:py-4">
      <div className="flex min-h-[62px] items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card px-4 shadow-sm md:px-6">
        <Link to="/" aria-label="Kejar Prestasi"><img src={headerLogo} alt="Kejar Prestasi" className="h-9 w-auto max-w-[165px] object-contain md:h-10 md:max-w-[190px]"/></Link>
        <nav className="hidden items-center gap-1 lg:flex">
          <Link to="/" className="px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-primary">Beranda</Link>
          <div ref={programRef} className="relative">
            <button type="button" aria-expanded={desktopProgramOpen} aria-haspopup="menu" onClick={()=>setDesktopProgramOpen(v=>!v)} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-secondary/70 hover:text-primary">
              Program <ChevronDown size={14} className={`transition-transform duration-200 ${desktopProgramOpen?"rotate-180":""}`}/>
            </button>
            {desktopProgramOpen&&<div role="menu" className="absolute left-1/2 top-[calc(100%+10px)] z-[80] w-[360px] -translate-x-1/2 rounded-2xl border border-border bg-card p-2 shadow-[0_20px_60px_rgba(15,23,42,.18)]">
              <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l border-t border-border bg-card"/>
              <Link to="/beasiswa-prestasi" onClick={()=>setDesktopProgramOpen(false)} className="relative flex gap-3 rounded-xl p-3 transition hover:bg-secondary">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><Trophy size={18}/></span>
                <span><b className="block text-sm">Beasiswa Prestasi</b><small className="text-muted-foreground">Program untuk pengembangan prestasi dan potensi.</small></span>
              </Link>
              <Link to="/beasiswa-ekonomi" onClick={()=>setDesktopProgramOpen(false)} className="relative mt-1 flex gap-3 rounded-xl p-3 transition hover:bg-secondary">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><HeartHandshake size={18}/></span>
                <span><b className="block text-sm">Beasiswa Ekonomi</b><small className="text-muted-foreground">Dukungan pendidikan berdasarkan kebutuhan ekonomi.</small></span>
              </Link>
              <Link to="/pendaftaran/umum" onClick={()=>setDesktopProgramOpen(false)} className="relative mt-1 flex gap-3 rounded-xl p-3 transition hover:bg-secondary">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><GraduationCap size={18}/></span>
                <span><b className="block text-sm">Beasiswa Umum</b><small className="text-muted-foreground">Program terbuka untuk dukungan pendidikan dan pengembangan diri.</small></span>
              </Link>
            </div>}
          </div>
          <Link to="/artikel" className="px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-primary">Wawasan</Link>
          <Link to="/tentang" className="px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-primary">Tentang Kami</Link>
        </nav>
        <Link to="/cek-status" className="hidden items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-bold hover:border-primary/30 hover:text-primary lg:inline-flex"><Search size={15}/> Cek Pendaftaran</Link>
        <button type="button" onClick={()=>setOpen(!open)} className="grid h-10 w-10 place-items-center rounded-xl border border-border lg:hidden" aria-label={open?"Tutup menu":"Buka menu"}>{open?<X size={19}/>:<Menu size={19}/>}</button>
      </div>
      {open&&<div className="mt-2 rounded-2xl border border-border bg-card p-3 shadow-card lg:hidden">
        <nav className="grid gap-1">
          <Link to="/" onClick={()=>setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold hover:bg-secondary">Beranda</Link>
          <button type="button" onClick={()=>setProgramOpen(!programOpen)} className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold hover:bg-secondary">Program <ChevronDown size={15} className={programOpen?"rotate-180 transition":"transition"}/></button>
          {programOpen&&<div className="ml-3 grid gap-1 border-l border-border pl-3"><Link to="/beasiswa-prestasi" onClick={()=>{setOpen(false);setProgramOpen(false)}} className="rounded-xl px-4 py-3 text-sm font-semibold hover:bg-secondary">Beasiswa Prestasi</Link><Link to="/beasiswa-ekonomi" onClick={()=>{setOpen(false);setProgramOpen(false)}} className="rounded-xl px-4 py-3 text-sm font-semibold hover:bg-secondary">Beasiswa Ekonomi</Link><Link to="/pendaftaran/umum" onClick={()=>{setOpen(false);setProgramOpen(false)}} className="rounded-xl px-4 py-3 text-sm font-semibold hover:bg-secondary">Beasiswa Umum</Link></div>}
          <Link to="/artikel" onClick={()=>setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold hover:bg-secondary">Wawasan</Link>
          <Link to="/tentang" onClick={()=>setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold hover:bg-secondary">Tentang Kami</Link>
          <Link to="/cek-status" onClick={()=>setOpen(false)} className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-bold"><Search size={15}/> Cek Pendaftaran</Link>
        </nav>
      </div>}
    </div>
  </header>
}
