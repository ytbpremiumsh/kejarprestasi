import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, FileText, Gift, PlayCircle, Share2, Trophy, HeartHandshake } from "lucide-react";
import type { ReactNode } from "react";
import { AdSlot } from "@/components/ads/AdSlot";

const persyaratan = [
  "Warga Negara Indonesia (WNI)",
  "Tinggal di Indonesia",
  "Pelajar aktif SD/MI sederajat",
  "Pelajar aktif SMP/MTs sederajat",
  "Pelajar aktif SMA/SMK/MA sederajat",
  "Mahasiswa aktif atau calon mahasiswa D3–S2",
  "Tanpa minimal nilai rapor atau IPK",
  "Mengikuti seluruh persyaratan yang ditetapkan",
];

const merchandise = ["Plakat Beasiswa", "Kaos", "Block Note", "Goodie Bag", "Sertifikat Beasiswa"];

const BENEFIT_IMAGE_URL =
  "https://zmlwicrlcuqgxfaskxic.supabase.co/storage/v1/object/public/admin-media/1778936443603-Benefit-Kejar-Prestasi--3.png";

const benefitList = [
  { strong: "Dana Pendidikan Beasiswa", rest: "" },
  { strong: "Merchandise menarik", rest: " dari Kejar Prestasi." },
  { strong: "Sertifikat Beasiswa", rest: " by Kejar Prestasi." },
  {
    prefix: "Peluang Menjadi ",
    strong: "Kontingen Ambassador",
    rest: " Program Kejar Prestasi.",
  },
  {
    prefix: "Dapatkan ",
    strong: "Akses Magang",
    rest: " di Kejar Prestasi Indonesia dan Partner.",
  },
];

export function CategoryPage({
  kind,
  title,
  tagline,
  desc,
  registerTo,
  shareTo,
}: {
  kind: "prestasi" | "ekonomi";
  title: string;
  tagline: string;
  desc: string;
  registerTo: "/pendaftaran/prestasi" | "/pendaftaran/ekonomi";
  shareTo: "/bagikan-poster/prestasi" | "/bagikan-poster/ekonomi";
}) {
  const isGold = kind === "ekonomi";
  const Icon: ReactNode = isGold ? <HeartHandshake /> : <Trophy />;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="container-page py-16 md:py-20">
          <Link to="/" className="text-xs font-semibold text-primary hover:underline">← Kembali ke Beranda</Link>
          <div className="mt-4 max-w-3xl">
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${isGold ? "bg-[oklch(0.92_0.14_85)] text-gold-foreground" : "bg-primary-soft text-primary"}`}>
              {Icon} {tagline}
            </span>
            <h1 className="mt-4 text-4xl md:text-5xl font-extrabold leading-tight text-foreground">{title}</h1>
            <p className="mt-4 text-muted-foreground text-lg">{desc}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to={shareTo} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:border-primary hover:text-primary transition">
                <Share2 size={16} /> Bagikan Poster
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* INFO */}
      <section className="container-page py-16 grid lg:grid-cols-2 gap-8">
        {/* Persyaratan */}
        <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
          <h2 className="text-2xl font-bold text-foreground">Persyaratan</h2>
          <p className="mt-1 text-sm text-muted-foreground">Pastikan kamu memenuhi seluruh persyaratan berikut.</p>
          <ul className="mt-6 space-y-3">
            {persyaratan.map((p) => (
              <li key={p} className="flex items-start gap-3 rounded-xl bg-secondary/50 p-3 text-sm text-foreground/90">
                <CheckCircle2 size={18} className="mt-0.5 text-primary shrink-0" /> {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Benefit */}
        <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
          <h2 className="text-2xl font-bold text-foreground">Benefit Beasiswa</h2>
          <p className="mt-1 text-sm text-muted-foreground">Total beasiswa Rp23.000.000/semester serta benefit pendukung.</p>

          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-secondary/30">
            <img
              src={BENEFIT_IMAGE_URL}
              alt="Benefit Beasiswa Kejar Prestasi"
              loading="lazy"
              decoding="async"
              width={1200}
              height={800}
              className="w-full h-auto object-cover"
            />
          </div>

          <div className="mt-6 rounded-2xl p-5 text-primary-foreground shadow-soft" style={{ background: "var(--gradient-primary)" }}>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-90">
              <PlayCircle size={16} /> Video Motivasi
            </div>
            <p className="mt-2 font-semibold text-lg leading-snug">
              "Menghadapi Tantangan dan Meraih Keberhasilan dalam Studi"
            </p>
          </div>

          <ul className="mt-6 space-y-2.5">
            {benefitList.map((b, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 rounded-xl bg-secondary/40 px-3.5 py-2.5 text-sm text-foreground/90"
              >
                <span
                  className={`mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${isGold ? "bg-[oklch(0.78_0.18_80)]" : "bg-primary"}`}
                />
                <span>
                  {b.prefix}
                  <strong className="font-semibold text-foreground">{b.strong}</strong>
                  {b.rest}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Gift size={16} className="text-primary" /> Merchandise Menarik
            </div>
            <ul className="mt-3 grid sm:grid-cols-2 gap-2.5">
              {merchandise.map((m) => (
                <li key={m} className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground/90">
                  <span className={`inline-block h-2 w-2 rounded-full ${isGold ? "bg-[oklch(0.78_0.18_80)]" : "bg-primary"}`} /> {m}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <AdSlot placement="category_middle" />

      {/* CTA — Pendaftaran (terpisah dari berkas) */}
      <section className="container-page pb-10">
        <div className="rounded-3xl border border-border bg-card p-8 md:p-10 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-foreground">Sudah memenuhi persyaratan?</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">Lengkapi formulir pendaftaran beasiswa.</p>
          </div>
          <Link to={registerTo} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-95 transition">
            Daftar Sekarang <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* CTA — Pengiriman Berkas (terpisah dari pendaftaran) */}
      <section className="container-page pb-20">
        <div className="rounded-3xl border border-border bg-secondary/40 p-8 md:p-10 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-foreground">Sudah daftar? Kirim berkas pendukung</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Unggah berkas khusus jalur {kind === "prestasi" ? "Prestasi" : "Ekonomi"}.
            </p>
          </div>
          <Link
            to={kind === "prestasi" ? "/berkas/prestasi" : "/berkas/ekonomi"}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:border-primary hover:text-primary transition"
          >
            <FileText size={16} /> Kirim Berkas
          </Link>
        </div>
      </section>

      <AdSlot placement="category_bottom" />
    </>
  );
}
