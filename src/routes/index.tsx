import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Crown, Gift, GraduationCap, HeartHandshake, ShieldCheck, Sparkles, Trophy, Users, Wallet } from "lucide-react";
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
      { name: "description", content: "Program beasiswa nasional untuk SD, SMP, SMA/SMK/MA, dan Mahasiswa. Total dukungan pendidikan hingga Rp23.000.000/semester." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60 bg-[radial-gradient(circle_at_78%_36%,oklch(0.92_0.12_285/.8),transparent_34%),radial-gradient(circle_at_12%_10%,oklch(0.94_0.1_300/.7),transparent_28%),linear-gradient(180deg,oklch(0.985_0.01_285),white)]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.22]" style={{ backgroundImage: "linear-gradient(to right, color-mix(in oklab, var(--primary) 9%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--primary) 9%, transparent) 1px, transparent 1px)", backgroundSize: "52px 52px", maskImage: "radial-gradient(ellipse at 45% 20%, black, transparent 74%)" }} />
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-24 h-[32rem] w-[32rem] rounded-full bg-primary/10 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="container-page relative grid items-center gap-8 py-10 sm:py-14 lg:min-h-[620px] lg:grid-cols-[0.92fr_1.08fr] lg:gap-4 lg:py-16">
          <div className="relative z-10 order-1 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/75 px-4 py-2 text-xs font-bold text-primary shadow-card backdrop-blur"><GraduationCap size={15} /> Program Beasiswa Pendidikan Section #3</div>
            <h1 className="mt-5 text-[2.55rem] font-black leading-[0.98] tracking-[-0.04em] text-foreground sm:text-5xl md:text-6xl lg:text-[4.35rem]">Raih Pendidikan,<span className="block bg-gradient-to-r from-primary via-[oklch(0.58_0.23_290)] to-[oklch(0.48_0.2_285)] bg-clip-text text-transparent">Wujudkan Prestasi</span></h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base md:text-lg">Program beasiswa pendidikan nasional untuk pelajar dan mahasiswa Indonesia. Tanpa minimal nilai, tanpa biaya pendaftaran.</p>
            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-2xl">
              <HeroFeature icon={<ShieldCheck size={18} />} title="Gratis 100%" text="Tidak dipungut biaya" />
              <HeroFeature icon={<GraduationCap size={18} />} title="Tanpa Minimal Nilai" text="Kesempatan untuk semua" />
              <HeroFeature icon={<CheckCircle2 size={18} />} title="Proses Transparan" text="Seleksi adil & terpercaya" />
              <HeroFeature icon={<Users size={18} />} title="Untuk Semua" text="SD hingga Mahasiswa" />
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => document.getElementById("timeline")?.scrollIntoView({ behavior: "smooth" })} className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[oklch(0.78_0.17_82)] px-7 py-3.5 text-sm font-bold text-[oklch(0.18_0.12_285)] shadow-[0_12px_30px_oklch(0.78_0.17_82/0.2)] transition hover:-translate-y-0.5 hover:brightness-105 sm:w-auto">Daftar Beasiswa Sekarang <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></button>
              <button type="button" onClick={() => document.getElementById("timeline")?.scrollIntoView({ behavior: "smooth" })} className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-primary/25 bg-white/70 px-7 py-3.5 text-sm font-bold text-primary backdrop-blur transition hover:-translate-y-0.5 hover:border-primary/50 hover:bg-white sm:w-auto">Lihat Timeline <ArrowRight size={16} /></button>
            </div>
          </div>
          <div className="relative order-2 min-h-[330px] sm:min-h-[430px] lg:min-h-[560px]">
            <div aria-hidden="true" className="absolute inset-x-2 bottom-3 top-8 rounded-[3rem] bg-primary/10 blur-3xl" />
            <div aria-hidden="true" className="absolute right-[19%] top-[8%] h-28 w-28 rounded-full bg-gold/20 blur-2xl" />
            <img src={heroImg} alt="Ilustrasi siswa Indonesia penerima beasiswa Kejar Prestasi" width={1024} height={1024} className="relative mx-auto h-full max-h-[570px] w-full object-contain object-center drop-shadow-[0_28px_42px_oklch(0.35_0.18_290/0.2)]" fetchPriority="high" />
          </div>
        </div>
        <div className="container-page relative pb-8 sm:pb-12">
          <div className="overflow-hidden rounded-[1.7rem] bg-gradient-to-r from-[oklch(0.31_0.2_285)] via-primary to-[oklch(0.38_0.2_285)] p-1 shadow-[0_20px_50px_oklch(0.35_0.18_285/0.18)]">
            <div className="grid overflow-hidden rounded-[1.45rem] bg-[oklch(0.32_0.2_285)] sm:grid-cols-3">
              <StatCard icon={<Wallet size={22} />} label="TOTAL BEASISWA" value="Rp 23.000.000" sub="per semester" />
              <StatCard icon={<Trophy size={22} />} label="Beasiswa Prestasi" value="Akademik & Non-Akademik" sub="Untuk pelajar berprestasi" />
              <StatCard icon={<HeartHandshake size={22} />} label="Beasiswa Ekonomi" value="Dukungan Finansial" sub="Bagi yang membutuhkan" />
            </div>
          </div>
        </div>
      </section>
      <AdSlot placement="after_hero" />
      <section className="container-page pt-12 pb-4 sm:pt-16"><Countdown /></section>
      <section className="container-page py-14 sm:py-16">
        <SectionHeader eyebrow="Kategori Beasiswa" title="Pilih Jalur Beasiswamu" desc="Tiga kategori, satu tujuan: membuka akses pendidikan untuk seluruh anak Indonesia." />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <CategoryCard tag="Beasiswa Prestasi" icon={<Trophy size={28} />} title="Untuk yang berprestasi, akademik & non-akademik" desc="Program beasiswa bagi pelajar dan mahasiswa yang memiliki prestasi akademik maupun non-akademik." to="/beasiswa-prestasi" />
          <CategoryCard tag="Beasiswa Ekonomi" icon={<HeartHandshake size={28} />} title="Untuk yang membutuhkan dukungan finansial" desc="Program beasiswa bagi pelajar dan mahasiswa yang membutuhkan dukungan finansial untuk pendidikan." to="/beasiswa-ekonomi" variant="gold" />
          <CategoryCard tag="Beasiswa Umum" icon={<GraduationCap size={28} />} title="Kesempatan umum untuk mahasiswa" desc="Program terbuka dengan seleksi profil diri, studi kasus, pengalaman, dan administrasi pendidikan." to="/pendaftaran/umum" />
        </div>
      </section>
      <AdSlot placement="after_categories" />
      <AboutMockup />
      <BenefitsSection />
      <FeaturedTabletBenefit />
      <AdSlot placement="after_benefits" />
      <AlumniSection />
      <AdSlot placement="after_alumni" />
      <TimelineSection />
      <FAQSection />
      <AdSlot placement="after_faq" />
    </>
  );
}

function FeaturedTabletBenefit() {
  return <section className="container-page pb-14 pt-4 sm:pb-16 sm:pt-8">
    <div className="relative overflow-hidden rounded-[2rem] border border-emerald-200 bg-[linear-gradient(135deg,oklch(0.985_0.025_155),oklch(0.965_0.055_160),white)] p-5 shadow-[0_22px_60px_rgba(5,150,105,.12)] sm:p-7 lg:p-9">
      <div aria-hidden="true" className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-emerald-300/25 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative grid items-center gap-7 lg:grid-cols-[1.05fr_.95fr] lg:gap-10">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[.12em] text-emerald-700 shadow-sm"><Crown size={14}/> Benefit Utama Platinum</div>
          <h2 className="mt-4 max-w-xl text-2xl font-black leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl">Kesempatan memperoleh <span className="text-emerald-700">Tablet Pendidikan & Dana Pendidikan</span> untuk Awardee</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">Benefit perangkat belajar dan dukungan dana pendidikan hingga Rp23 juta per semester khusus peserta Jalur Akselerasi Platinum yang terpilih menjadi Awardee.</p>
          <div className="mt-5 grid max-w-xl gap-3 sm:grid-cols-3">
            <MiniBenefit icon={<Gift size={18}/>} title="Benefit Eksklusif" text="Khusus jalur Platinum" />
            <MiniBenefit icon={<GraduationCap size={18}/>} title="Tablet & Dana Pendidikan" text="Hingga Rp23 juta / semester" />
            <MiniBenefit icon={<Sparkles size={18}/>} title="Khusus Awardee" text="Berlaku bagi penerima terpilih" />
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/beasiswa-prestasi" className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3.5 text-sm font-black text-white shadow-[0_12px_28px_rgba(5,150,105,.22)] transition hover:-translate-y-0.5 hover:bg-emerald-700">Lihat Jalur Prestasi <ArrowRight size={16}/></Link>
            <Link to="/beasiswa-ekonomi" className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-6 py-3.5 text-sm font-bold text-emerald-800 transition hover:-translate-y-0.5 hover:bg-white">Lihat Jalur Ekonomi <ArrowRight size={16}/></Link>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[520px]">
          <div className="absolute inset-x-[12%] bottom-[7%] h-20 rounded-full bg-emerald-600/15 blur-2xl" />
          <div className="relative min-h-[280px] sm:min-h-[340px]">
            <div className="tablet-home-stage" aria-hidden="true">
              <div className="tablet-home-back"><span className="tablet-home-camera"/></div>
              <div className="tablet-home-front"><span className="tablet-home-screen"><span className="tablet-home-glow"/></span></div>
              <span className="tablet-home-podium"/>
            </div>
          </div>
          <div className="mx-auto -mt-2 flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-4 py-2 text-xs font-bold text-emerald-800 shadow-sm backdrop-blur"><ShieldCheck size={14}/> Tablet Pendidikan + Dana hingga Rp23 Juta</div>
        </div>
      </div>
    </div>
  </section>;
}

function MiniBenefit({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="rounded-2xl border border-emerald-100 bg-white/75 p-3.5 shadow-sm backdrop-blur"><div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700">{icon}</div><p className="mt-2 text-xs font-extrabold text-foreground">{title}</p><p className="mt-1 text-[11px] leading-4 text-muted-foreground">{text}</p></div>;
}

function HeroFeature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="group rounded-2xl border border-border/70 bg-white/75 p-3 shadow-card backdrop-blur transition hover:-translate-y-1 hover:shadow-soft"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary transition group-hover:scale-105">{icon}</div><div className="mt-2 text-[11px] font-bold leading-tight text-foreground sm:text-xs">{title}</div><div className="mt-1 text-[10px] leading-4 text-muted-foreground">{text}</div></div>;
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return <div className="flex items-center gap-4 border-white/10 p-5 text-white sm:border-r sm:p-6 last:border-r-0"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[oklch(0.82_0.16_82)] ring-1 ring-white/10">{icon}</div><div className="min-w-0"><div className="text-[10px] font-semibold uppercase tracking-wider text-white/65">{label}</div><div className="mt-1 truncate text-base font-extrabold sm:text-lg">{value}</div><div className="mt-0.5 text-xs text-white/60">{sub}</div></div></div>;
}

function SectionHeader({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return <div className="mx-auto max-w-2xl text-center"><span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary-soft px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">{eyebrow}</span><h2 className="mt-4 text-3xl font-extrabold leading-[1.1] text-foreground sm:text-[2.6rem]">{title}</h2><span aria-hidden="true" className="mx-auto mt-4 block h-1 w-16 rounded-full bg-gradient-to-r from-primary to-gold" /><p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">{desc}</p></div>;
}

function CategoryCard({ tag, icon, title, desc, to, variant }: { tag: string; icon: React.ReactNode; title: string; desc: string; to: "/beasiswa-prestasi" | "/beasiswa-ekonomi" | "/pendaftaran/umum"; variant?: "gold" }) {
  const isGold = variant === "gold";
  return <Link to={to} className="group relative block overflow-hidden rounded-[2rem] border border-border/80 bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft sm:p-8"><span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${isGold ? "bg-gradient-to-r from-gold to-[oklch(0.75_0.18_60)]" : "bg-gradient-to-r from-primary to-[oklch(0.55_0.22_290)]"}`} /><div aria-hidden="true" className={`absolute -right-16 -top-16 h-52 w-52 rounded-full blur-3xl opacity-40 transition-all duration-500 group-hover:scale-125 ${isGold ? "bg-gold/25" : "bg-primary/20"}`} /><div className="relative flex items-start justify-between gap-5"><div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border shadow-card transition-transform group-hover:scale-105 ${isGold ? "border-gold/20 bg-gold/10 text-gold-foreground" : "border-primary/15 bg-primary-soft text-primary"}`}>{icon}</div><span className="rounded-full border border-border bg-background/70 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pelajari</span></div><span className={`relative mt-6 inline-block text-xs font-bold uppercase tracking-wider ${isGold ? "text-[oklch(0.55_0.16_75)]" : "text-primary"}`}>{tag}</span><h3 className="mt-2 text-xl font-bold leading-snug text-foreground sm:text-2xl">{title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{desc}</p><ul className="relative mt-5 space-y-2 text-sm text-foreground/80">{["Terbuka untuk SD, SMP, SMA/SMK/MA, & Mahasiswa", "Tanpa minimal nilai rapor / IPK", "Tidak dipungut biaya"].map((x) => <li key={x} className="flex items-start gap-2"><CheckCircle2 size={16} className={`mt-0.5 shrink-0 ${isGold ? "text-[oklch(0.65_0.16_75)]" : "text-primary"}`} />{x}</li>)}</ul><div className="relative mt-7 inline-flex items-center gap-2 text-sm font-bold text-primary">Lihat Detail <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></div></Link>;
}
