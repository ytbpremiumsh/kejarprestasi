import { Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import logo from "@/assets/logo-kp.png";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="container-page py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center">
            <img src={logo} alt="Logo Kejar Prestasi x Atskolla" className="h-10 w-auto" loading="lazy" />
          </div>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            Meraih Pendidikan, Mewujudkan Prestasi. Program beasiswa nasional untuk pelajar dan mahasiswa Indonesia.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">Beasiswa</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/beasiswa-prestasi" className="hover:text-primary">Beasiswa Prestasi</Link></li>
            <li><Link to="/beasiswa-ekonomi" className="hover:text-primary">Beasiswa Ekonomi</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">Bagikan Poster</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/bagikan-poster/prestasi" className="hover:text-primary">Poster Prestasi</Link></li>
            <li><Link to="/bagikan-poster/ekonomi" className="hover:text-primary">Poster Ekonomi</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border bg-background">
        <div className="container-page py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-start gap-2 text-xs text-destructive font-medium">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>Hati-hati terhadap penipuan yang mengatasnamakan Kejar Prestasi.</span>
          </div>
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Kejar Prestasi. Tidak dipungut biaya.
          </div>
        </div>
      </div>
    </footer>
  );
}
