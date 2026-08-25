import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, HeartHandshake, Trophy, Users, Wallet, Share2, CalendarClock, ArrowRight, CheckCircle2, GraduationCap, Sparkles, FileText } from "lucide-react";
import heroImg from "@/assets/students-hero.png";
import { Countdown } from "@/components/Countdown";
import { AboutMockup } from "@/components/AboutMockup";
import { FAQSection } from "@/components/FAQSection";
import { TimelineSection } from "@/components/TimelineSection";
import { BenefitsSection } from "@/components/BenefitsSection";
import { AlumniSection } from "@/components/AlumniSection";
import { AdSlot } from "@/components/ads/AdSlot";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Beasiswa Pendidikan Kejar Prestasi Section #3" },
      { name: "description", content: "Program beasiswa nasional untuk SD, SMP, SMA/SMK/MA, dan Mahasiswa. Total beasiswa Rp17.000.000/semester. Tidak dipungut biaya." },
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
        className="relative overflow-hidden border-b border-border/60"
        style={{ background: "var(--gradient-hero)" }}
      >
        {/* decorative layers */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, color-mix(in oklab, var(--primary) 10%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--primary) 10%, transparent) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse at 30% 20%, black, transparent 70%)",
          }}
        />
        <div aria-hidden="true" className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-gold/25 blur-3xl" />

        <div className="container-page relative py-12 md:py-24 grid lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-14 items-center">
          {/* Title block — first on mobile, part of left column on desktop */}
          <div className="order-1 lg:order-1 lg:hidden space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/80 px-4 py-1.5 text-xs font-semibold text-primary shadow-card backdrop-blur">
              <Sparkles size={14} /> Meraih Pendidikan, Mewujudkan Prestasi
            </span>
            <h1 className="relative text-[2rem] sm:text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground">
              <span className="block">Beasiswa</span>
              <span className="relative inline-block bg-gradient-to-br from-primary via-[oklch(0.55_0.22_290)] to-[oklch(0.45_0.22_280)] bg-clip-text text-transparent drop-shadow-[0_2px_12px_oklch(0.55_0.22_290/0.25)]">
                Kejar Prestasi
                <svg aria-hidden="true" viewBox="0 0 200 8" preserveAspectRatio="none" className="absolute -bottom-1 left-0 h-1.5 w-full text-gold">
                  <path d="M2 5 Q 50 1, 100 4 T 198 4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </span>
              <span className="ml-2">Section</span>{" "}
              <span className="relative inline-block bg-gradient-to-br from-[oklch(0.75_0.18_80)] to-[oklch(0.55_0.16_60)] bg-clip-text text-transparent">
                #3
                <span className="absolute -top-1 -right-2 h-2 w-2 rounded-full bg-[oklch(0.75_0.18_80)] shadow-[0_0_12px_oklch(0.75_0.18_80)]" />
              </span>
            </h1>
          </div>

          <div className="order-2 lg:order-2 relative">
            <div aria-hidden="true" className="absolute inset-x-6 bottom-6 top-10 rounded-[2.5rem] bg-gradient-to-br from-primary/10 via-transparent to-gold/20 blur-2xl" />
            <img
              src={heroImg}
              alt="Ilustrasi siswa Indonesia penerima beasiswa Kejar Prestasi"
              width={1024}
              height={1024}
              className="relative w-full h-auto max-w-md mx-auto lg:max-w-none drop-shadow-[0_24px_40px_oklch(0.38_0.18_295/0.18)]"
              fetchPriority="high"
            />
          </div>

          <div className="order-3 lg:order-1 space-y-6 md:space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="hidden lg:inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/80 px-4 py-1.5 text-xs font-semibold text-primary shadow-card backdrop-blur">
              <Sparkles size={14} /> Meraih Pendidikan, Mewujudkan Prestasi
            </span>
            <h1 className="hidden lg:block relative text-3xl sm:text-4xl md:text-5xl lg:text-[4rem] font-extrabold leading-[1.02] tracking-tight text-foreground">
              <span className="block">Beasiswa</span>
              <span className="relative inline-block bg-gradient-to-br from-primary via-[oklch(0.55_0.22_290)] to-[oklch(0.45_0.22_280)] bg-clip-text text-transparent drop-shadow-[0_4px_24px_oklch(0.55_0.22_290/0.3)]">
                Kejar Prestasi
                <svg aria-hidden="true" viewBox="0 0 300 10" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-2 w-full text-gold">
                  <path d="M2 6 Q 75 1, 150 5 T 298 5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>{" "}
              <span className="inline-block">Section</span>{" "}
              <span className="relative inline-block bg-gradient-to-br from-[oklch(0.75_0.18_80)] to-[oklch(0.55_0.16_60)] bg-clip-text text-transparent">
                #3
                <span className="absolute -top-1 -right-3 h-2.5 w-2.5 rounded-full bg-[oklch(0.75_0.18_80)] shadow-[0_0_16px_oklch(0.75_0.18_80)]" />
              </span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
              Program beasiswa pendidikan nasional untuk pelajar dan mahasiswa Indonesia.
              Tanpa minimal nilai, tanpa biaya pendaftaran.
            </p>

            <div className="flex flex-wrap gap-2">
              {jenjang.map((j) => (
                <span key={j} className="rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur">
                  {j}
                </span>
              ))}
            </div>

            <div className="grid sm:grid-cols-3 gap-3 pt-2">
              <HighlightCard icon={<Wallet size={18} />} label="Total Beasiswa" value="Rp17.000.000" sub="per semester" highlight />
              <HighlightCard icon={<Trophy size={18} />} label="Beasiswa" value="Prestasi" sub="Akademik & non-akademik" />
              <HighlightCard icon={<HeartHandshake size={18} />} label="Beasiswa" value="Ekonomi" sub="Dukungan finansial" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
              <a href="#timeline" className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-soft hover:opacity-95 hover:-translate-y-0.5 transition sm:w-auto sm:min-w-[260px]">
                Daftar Sekarang <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </a>
              <p className="text-xs text-muted-foreground sm:max-w-[180px]">
                Gratis 100% — tidak dipungut biaya apa pun.
              </p>
            </div>
          </div>
        </div>

        {/* stat strip */}
        <div className="container-page relative pb-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden rounded-3xl border border-border bg-border shadow-card">
            {[
              { k: "Rp17 Jt", v: "Total beasiswa / semester" },
              { k: "4 Jenjang", v: "SD sampai Mahasiswa" },
              { k: "2 Kategori", v: "Prestasi & Ekonomi" },
              { k: "Rp0", v: "Biaya pendaftaran" },
            ].map((s) => (
              <div key={s.k} className="bg-card px-5 py-6 text-center">
                <div className="text-xl md:text-2xl font-extrabold text-primary">{s.k}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AdSlot placement="after_hero" />

      {/* COUNTDOWN — di atas Kategori Beasiswa */}
      <section className="container-page pt-16 pb-4">
        <Countdown />
      </section>

      {/* KATEGORI */}
      <section className="container-page py-16">
        <SectionHeader
          eyebrow="Kategori Beasiswa"
          title="Pilih Jalur Beasiswamu"
          desc="Dua kategori, satu tujuan: membuka akses pendidikan untuk seluruh anak Indonesia."
        />

        <div className="mt-12 grid md:grid-cols-2 gap-6">
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


      <AdSlot placement="after_categories" />

      {/* TENTANG / MOCKUP */}
      <AboutMockup />

      {/* BENEFIT */}
      <BenefitsSection />

      <AdSlot placement="after_benefits" />

      {/* PERAIH BEASISWA SEBELUMNYA */}
      <AlumniSection />

      <AdSlot placement="after_alumni" />

      {/* TIMELINE */}
      <TimelineSection />

      {/* FAQ */}
      <FAQSection />




      <AdSlot placement="after_faq" />
    </>
  );
}

function HighlightCard({ icon, label, value, sub, highlight }: { icon: React.ReactNode; label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 transition hover:-translate-y-0.5 ${
        highlight
          ? "border-transparent text-primary-foreground shadow-soft"
          : "border-border bg-card/80 text-foreground shadow-card backdrop-blur"
      }`}
      style={highlight ? { background: "var(--gradient-primary)" } : undefined}
    >
      {highlight && <span aria-hidden="true" className="absolute -top-8 -right-8 h-20 w-20 rounded-full bg-gold/30 blur-2xl" />}
      <div className={`relative flex items-center gap-2 text-xs font-medium ${highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
        {icon} {label}
      </div>
      <div className="relative mt-1.5 text-lg font-bold">{value}</div>
      <div className={`relative text-xs ${highlight ? "text-primary-foreground/75" : "text-muted-foreground"}`}>{sub}</div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
        {eyebrow}
      </span>
      <h2 className="mt-4 text-3xl md:text-[2.6rem] font-extrabold leading-[1.1] text-foreground">{title}</h2>
      <span aria-hidden="true" className="mt-4 mx-auto block h-1 w-16 rounded-full bg-gradient-to-r from-primary to-gold" />
      <p className="mt-4 text-muted-foreground">{desc}</p>
    </div>
  );
}

function CategoryCard({ tag, icon, title, desc, to, variant }: { tag: string; icon: React.ReactNode; title: string; desc: string; to: "/beasiswa-prestasi" | "/beasiswa-ekonomi"; variant?: "gold" }) {
  const isGold = variant === "gold";
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-card hover:shadow-soft hover:-translate-y-1 transition-all duration-300">
      <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${isGold ? "bg-gradient-to-r from-gold to-[oklch(0.75_0.18_60)]" : "bg-gradient-to-r from-primary to-[oklch(0.55_0.22_290)]"}`} />
      <div className={`absolute -top-16 -right-16 h-48 w-48 rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition ${isGold ? "bg-[oklch(0.88_0.16_85)]/60" : "bg-primary/30"}`} />
      <div className="relative">
        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl shadow-card ${isGold ? "bg-[oklch(0.92_0.14_85)] text-gold-foreground" : "bg-primary-soft text-primary"}`}>
          {icon}
        </div>
        <span className={`mt-5 inline-block text-xs font-semibold uppercase tracking-wider ${isGold ? "text-[oklch(0.55_0.16_75)]" : "text-primary"}`}>{tag}</span>
        <h3 className="mt-2 text-xl md:text-2xl font-bold leading-snug text-foreground">{title}</h3>
        <p className="mt-3 text-sm text-muted-foreground">{desc}</p>

        <ul className="mt-5 space-y-2 text-sm text-foreground/80">
          {["Terbuka untuk SD, SMP, SMA/SMK/MA, & Mahasiswa", "Tanpa minimal nilai rapor / IPK", "Tidak dipungut biaya"].map((x) => (
            <li key={x} className="flex items-start gap-2"><CheckCircle2 size={16} className={`mt-0.5 ${isGold ? "text-[oklch(0.65_0.16_75)]" : "text-primary"}`} /> {x}</li>
          ))}
        </ul>

        <Link to={to} className="group/btn mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-95 transition">
          Lihat Detail <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}


// Suppress unused
void Award;
void Users;
