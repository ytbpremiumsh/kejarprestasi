import { Link } from "@tanstack/react-router";
import { Download, Share2, Trophy, HeartHandshake, Facebook, Instagram } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo-kp.png";

export function SharePosterPage({ kind }: { kind: "prestasi" | "ekonomi" }) {
  const isGold = kind === "ekonomi";
  const label = isGold ? "Beasiswa Ekonomi" : "Beasiswa Prestasi";
  const url = typeof window !== "undefined" ? window.location.origin + (isGold ? "/beasiswa-ekonomi" : "/beasiswa-prestasi") : "https://kejarprestasi.id";
  const text = `Daftar ${label} — Beasiswa Kejar Prestasi Section #3. Total Rp23.000.000/semester. Tidak dipungut biaya. ${url}`;

  const [shares, setShares] = useState({ wa: 0, ig: 0, fb: 0, x: 0 });

  const track = (k: keyof typeof shares) => setShares((s) => ({ ...s, [k]: s[k] + 1 }));

  const links = [
    { key: "wa" as const, label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(text)}`, icon: <Share2 size={16} />, color: "bg-[oklch(0.72_0.17_150)]" },
    { key: "fb" as const, label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, icon: <Facebook size={16} />, color: "bg-[oklch(0.50_0.18_260)]" },
    { key: "x" as const, label: "X (Twitter)", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, icon: <Share2 size={16} />, color: "bg-foreground" },
    { key: "ig" as const, label: "Instagram", href: `https://www.instagram.com/`, icon: <Instagram size={16} />, color: "bg-gradient-to-tr from-[oklch(0.65_0.20_30)] to-[oklch(0.55_0.23_310)]" },
  ];

  return (
    <section className="container-page py-16">
      <Link to="/" className="text-xs font-semibold text-primary hover:underline">← Kembali ke Beranda</Link>
      <div className="mt-4 grid lg:grid-cols-[1.1fr_1fr] gap-10 items-start">
        {/* Poster preview */}
        <div className="rounded-3xl border border-border bg-card p-4 shadow-card">
          <div
            className="relative aspect-[3/4] rounded-2xl overflow-hidden p-8 flex flex-col justify-between text-primary-foreground"
            style={{ background: isGold ? "linear-gradient(160deg, oklch(0.45 0.18 295), oklch(0.65 0.18 80))" : "var(--gradient-primary)" }}
          >
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2">
                <img src={logo} alt="" width={40} height={40} className="h-10 w-10 rounded-full bg-white p-1" />
                <div className="text-xs font-semibold uppercase tracking-widest opacity-90">Kejar Prestasi · Section #3</div>
              </div>
              <h2 className="mt-8 text-3xl md:text-4xl font-extrabold leading-tight">
                {label}
              </h2>
              <p className="mt-2 text-sm opacity-90 max-w-xs">
                Meraih Pendidikan, Mewujudkan Prestasi.
              </p>
            </div>

            <div className="relative space-y-3">
              <div className="rounded-2xl bg-white/15 backdrop-blur p-4">
                <div className="text-[11px] uppercase tracking-wider opacity-80">Total Beasiswa</div>
                <div className="text-2xl font-extrabold">Rp23.000.000<span className="text-sm font-medium opacity-80"> / semester</span></div>
              </div>
              <div className="text-[11px] opacity-80">SD · SMP · SMA/SMK/MA · Mahasiswa · Tidak dipungut biaya</div>
            </div>

            <div className="absolute bottom-6 right-6 inline-flex items-center gap-1.5 rounded-full bg-[oklch(0.85_0.16_85)] px-3 py-1 text-[11px] font-bold text-gold-foreground">
              {isGold ? <HeartHandshake size={12} /> : <Trophy size={12} />} {label}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">Bagikan Poster {label}</h1>
            <p className="mt-2 text-muted-foreground">Bantu sebarkan informasi beasiswa ini kepada teman dan keluarga.</p>
          </div>

          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.print(); }}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-95 transition"
          >
            <Download size={16} /> Download Poster
          </a>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <div className="text-sm font-semibold text-foreground">Bagikan ke Media Sosial</div>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {links.map((l) => (
                <a
                  key={l.key}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => track(l.key)}
                  className="group flex items-center justify-between rounded-2xl border border-border bg-background p-3 hover:border-primary transition"
                >
                  <span className="flex items-center gap-3">
                    <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-white ${l.color}`}>{l.icon}</span>
                    <span className="text-sm font-medium text-foreground">{l.label}</span>
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">{shares[l.key]}x</span>
                </a>
              ))}
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              Total share sesi ini: <span className="font-semibold text-foreground">{Object.values(shares).reduce((a, b) => a + b, 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
