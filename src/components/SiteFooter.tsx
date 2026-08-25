import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Instagram, Mail, Send, ShieldCheck } from "lucide-react";
import { useBranding } from "@/hooks/use-branding";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const { footerLogo } = useBranding();
  return <footer className="mt-20 border-t border-border bg-foreground text-background">
    <div className="container-page py-12 md:py-16">
      <div className="grid gap-10 border-b border-background/15 pb-12 lg:grid-cols-[1.2fr_.8fr_.8fr]">
        <div className="max-w-xl"><img src={footerLogo} alt="Kejar Prestasi" className="h-10 w-auto max-w-[190px] object-contain" loading="lazy" /><h2 className="mt-7 text-2xl font-extrabold leading-tight md:text-3xl">Kesempatan pendidikan dimulai dari satu langkah.</h2><p className="mt-3 max-w-lg text-sm leading-6 text-background/60">Kejar Prestasi membuka akses program beasiswa bagi pelajar dan mahasiswa Indonesia melalui jalur Prestasi dan Ekonomi.</p><div className="mt-6 flex flex-wrap gap-3"><Link to="/daftar" className="inline-flex items-center gap-2 rounded-full bg-background px-5 py-3 text-sm font-bold text-foreground">Lihat Program <ArrowUpRight size={16} /></Link><Link to="/cek-status" className="rounded-full border border-background/20 px-5 py-3 text-sm font-semibold text-background">Cek Status</Link></div></div>
        <div><p className="text-xs font-bold uppercase tracking-[.18em] text-background/40">Navigasi</p><div className="mt-5 grid gap-3 text-sm"><Link to="/beasiswa-prestasi" className="text-background/75 hover:text-background">Beasiswa Prestasi</Link><Link to="/beasiswa-ekonomi" className="text-background/75 hover:text-background">Beasiswa Ekonomi</Link><Link to="/artikel" className="text-background/75 hover:text-background">Artikel</Link><Link to="/tentang" className="text-background/75 hover:text-background">Tentang Kami</Link></div></div>
        <div><p className="text-xs font-bold uppercase tracking-[.18em] text-background/40">Kontak Resmi</p><div className="mt-5 space-y-3 text-sm text-background/75"><a href="mailto:halo@kejarprestasi.id" className="flex items-center gap-2 hover:text-background"><Mail size={15} /> halo@kejarprestasi.id</a><a href="https://instagram.com/kejarprestasi_id" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-background"><Instagram size={15} /> @kejarprestasi_id</a><a href="https://wa.me/6287878344426" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-background"><Send size={15} /> WhatsApp Program</a></div><div className="mt-6 flex gap-2 rounded-2xl border border-background/15 bg-background/5 p-4 text-xs leading-5 text-background/60"><ShieldCheck size={17} className="mt-0.5 shrink-0 text-background" /><span>Gunakan hanya kanal resmi Kejar Prestasi untuk informasi program dan proses pendaftaran.</span></div></div>
      </div>
      <div className="flex flex-col gap-3 pt-6 text-xs text-background/45 sm:flex-row sm:items-center sm:justify-between"><p>© {year} Kejar Prestasi. Seluruh hak cipta dilindungi.</p><div className="flex gap-5"><span>Program Pendidikan Indonesia</span><span>Kejar Prestasi × ATSkolla</span></div></div>
    </div>
  </footer>;
}
