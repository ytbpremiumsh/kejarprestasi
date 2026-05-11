import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, HeartHandshake, Trophy, Users, Wallet, Share2, CalendarClock, ArrowRight, CheckCircle2, GraduationCap, Sparkles } from "lucide-react";
import heroImg from "@/assets/students-hero.png";
import { Countdown } from "@/components/Countdown";
import { AboutMockup } from "@/components/AboutMockup";
import { FAQSection } from "@/components/FAQSection";
import { TimelineSection } from "@/components/TimelineSection";
import { BenefitsSection } from "@/components/BenefitsSection";
import { AlumniSection } from "@/components/AlumniSection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Beasiswa Pendidikan Kejar Prestasi Section #3" },
      { name: "description", content: "Program beasiswa nasional untuk SD, SMP, SMA/SMK/MA, dan Mahasiswa. Total beasiswa Rp23.000.000/semester. Tidak dipungut biaya." },
    ],
  }),
  component: Index,
});

const jenjang = ["SD", "SMP", "SMA/SMK/MA", "Mahasiswa"];

function Index() {
  return (
    <>
      {/* HERO */}
      <section
        className="relative overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="container-page py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-4 py-1.5 text-xs font-semibold text-primary">
              <Sparkles size={14} /> Meraih Pendidikan, Mewujudkan Prestasi
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05] text-foreground">
              Beasiswa <span className="text-primary">Kejar Prestasi</span> Section <span className="text-[oklch(0.65_0.18_80)]">#3</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl">
              Program beasiswa pendidikan nasional untuk pelajar dan mahasiswa Indonesia.
              Tanpa minimal nilai, tanpa biaya pendaftaran.
            </p>

            <div className="flex flex-wrap gap-2">
              {jenjang.map((j) => (
                <span key={j} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground/80">
                  {j}
                </span>
              ))}
            </div>

            <div className="grid sm:grid-cols-3 gap-3 pt-2">
              <HighlightCard icon={<Wallet size={18} />} label="Total Beasiswa" value="Rp23.000.000" sub="per semester" highlight />
              <HighlightCard icon={<Trophy size={18} />} label="Beasiswa" value="Prestasi" sub="Akademik & non-akademik" />
              <HighlightCard icon={<HeartHandshake size={18} />} label="Beasiswa" value="Ekonomi" sub="Dukungan finansial" />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/beasiswa-prestasi" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-95 transition">
                Daftar Sekarang <ArrowRight size={16} />
              </Link>
              <a href="#timeline" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:border-primary hover:text-primary transition">
                <CalendarClock size={16} /> Lihat Timeline
              </a>
              <Link to="/bagikan-poster/prestasi" className="inline-flex items-center gap-2 rounded-full bg-[var(--gradient-gold)] px-6 py-3 text-sm font-semibold text-gold-foreground shadow-gold hover:opacity-95 transition" style={{ background: "var(--gradient-gold)" }}>
                <Share2 size={16} /> Bagikan Poster
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-primary/15 via-transparent to-[oklch(0.85_0.16_85)]/25 blur-2xl" />
            <div className="relative rounded-[2rem] bg-card/60 backdrop-blur p-4 shadow-soft border border-border/60">
              <img
                src={heroImg}
                alt="Ilustrasi siswa Indonesia penerima beasiswa Kejar Prestasi"
                width={1024}
                height={1024}
                className="w-full h-auto"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </section>

      {/* KATEGORI + COUNTDOWN */}
      <section className="container-page py-20">
        <SectionHeader
          eyebrow="Kategori Beasiswa"
          title="Pilih Jalur Beasiswamu"
          desc="Dua kategori, satu tujuan: membuka akses pendidikan untuk seluruh anak Indonesia."
        />

        <div className="mt-10">
          <Countdown />
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-6">
          <CategoryCard
            tag="Beasiswa Prestasi"
            icon={<Trophy />}
            title="Untuk yang berprestasi, akademik & non-akademik"
            desc="Program beasiswa bagi pelajar dan mahasiswa yang memiliki prestasi akademik maupun non akademik."
            to="/beasiswa-prestasi"
          />
          <CategoryCard
            tag="Beasiswa Ekonomi"
            icon={<HeartHandshake />}
            title="Untuk yang membutuhkan dukungan finansial"
            desc="Program beasiswa bagi pelajar dan mahasiswa yang membutuhkan dukungan finansial untuk pendidikan."
            to="/beasiswa-ekonomi"
            variant="gold"
          />
        </div>
      </section>

      {/* TENTANG / MOCKUP */}
      <AboutMockup />

      {/* TIMELINE */}
      <TimelineSection />

      {/* FAQ */}
      <FAQSection />

      {/* CTA */}
      <section className="container-page py-20">
        <div className="relative overflow-hidden rounded-3xl p-10 md:p-14 text-primary-foreground shadow-soft" style={{ background: "var(--gradient-primary)" }}>
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[oklch(0.85_0.16_85)]/30 blur-3xl" />
          <div className="relative grid md:grid-cols-[1.4fr_1fr] gap-8 items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                <GraduationCap size={14} /> Tidak dipungut biaya
              </span>
              <h2 className="mt-4 text-3xl md:text-4xl font-extrabold leading-tight">
                Siap meraih beasiswa hingga<br /> Rp23.000.000/semester?
              </h2>
              <p className="mt-3 text-primary-foreground/85 max-w-lg">
                Daftarkan dirimu sekarang dan jadi bagian dari Kejar Prestasi Section #3.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 md:items-stretch">
              <Link to="/beasiswa-prestasi" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary hover:bg-white/95 transition">
                <Trophy size={16} /> Daftar Beasiswa Prestasi
              </Link>
              <Link to="/beasiswa-ekonomi" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition">
                <HeartHandshake size={16} /> Daftar Beasiswa Ekonomi
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function HighlightCard({ icon, label, value, sub, highlight }: { icon: React.ReactNode; label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${highlight ? "border-transparent bg-primary text-primary-foreground shadow-soft" : "border-border bg-card text-foreground shadow-card"}`}>
      <div className={`flex items-center gap-2 text-xs font-medium ${highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
        {icon} {label}
      </div>
      <div className="mt-1.5 text-lg font-bold">{value}</div>
      <div className={`text-xs ${highlight ? "text-primary-foreground/75" : "text-muted-foreground"}`}>{sub}</div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <span className="inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">{eyebrow}</span>
      <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-foreground">{title}</h2>
      <p className="mt-3 text-muted-foreground">{desc}</p>
    </div>
  );
}

function CategoryCard({ tag, icon, title, desc, to, variant }: { tag: string; icon: React.ReactNode; title: string; desc: string; to: "/beasiswa-prestasi" | "/beasiswa-ekonomi"; variant?: "gold" }) {
  const isGold = variant === "gold";
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-card hover:shadow-soft hover:-translate-y-1 transition-all duration-300">
      <div className={`absolute -top-16 -right-16 h-48 w-48 rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition ${isGold ? "bg-[oklch(0.88_0.16_85)]/60" : "bg-primary/30"}`} />
      <div className="relative">
        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${isGold ? "bg-[oklch(0.92_0.14_85)] text-gold-foreground" : "bg-primary-soft text-primary"}`}>
          {icon}
        </div>
        <span className={`mt-5 inline-block text-xs font-semibold uppercase tracking-wider ${isGold ? "text-[oklch(0.55_0.16_75)]" : "text-primary"}`}>{tag}</span>
        <h3 className="mt-2 text-xl md:text-2xl font-bold text-foreground">{title}</h3>
        <p className="mt-3 text-sm text-muted-foreground">{desc}</p>

        <ul className="mt-5 space-y-2 text-sm text-foreground/80">
          {["Terbuka untuk SD, SMP, SMA/SMK/MA, & Mahasiswa", "Tanpa minimal nilai rapor / IPK", "Tidak dipungut biaya"].map((x) => (
            <li key={x} className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 text-primary" /> {x}</li>
          ))}
        </ul>

        <Link to={to} className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-95 transition">
          Lihat Detail <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

// Suppress unused
void Award;
void Users;
