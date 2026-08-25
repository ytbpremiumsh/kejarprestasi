import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, FileText, HeartHandshake, Share2, Sparkles, Trophy, Wallet, Users, ShieldCheck, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { AdSlot } from "@/components/ads/AdSlot";

const persyaratan = ["Warga Negara Indonesia dan berdomisili di Indonesia", "Terdaftar sebagai pelajar atau mahasiswa aktif", "Jenjang SD/MI, SMP/MTs, SMA/SMK/MA, hingga D3–S2", "Tidak ada batas minimum nilai rapor atau IPK", "Mengisi data pendaftaran dengan benar dan lengkap", "Mengikuti tahapan seleksi sesuai jadwal program"];
const benefitPrestasi = [
  { icon: Trophy, title: "Apresiasi Pencapaian", desc: "Ruang untuk menguatkan perjalanan akademik maupun non-akademikmu." },
  { icon: Sparkles, title: "Dukungan Semester", desc: "Bantuan pendidikan yang dapat membantu kebutuhan belajar selama satu semester." },
  { icon: Users, title: "Relasi Positif", desc: "Terhubung dengan penerima lain yang memiliki semangat tumbuh dan berprestasi." },
  { icon: ShieldCheck, title: "Pengakuan Program", desc: "Sertifikat sebagai bagian dari pengalaman mengikuti program Kejar Prestasi." },
];
const benefitEkonomi = [
  { icon: Wallet, title: "Meringankan Biaya Belajar", desc: "Dukungan finansial untuk membantu kebutuhan pendidikan yang sedang dijalani." },
  { icon: HeartHandshake, title: "Kesempatan Tetap Terbuka", desc: "Kesempatan berkembang bagi peserta yang memiliki tantangan dalam pembiayaan pendidikan." },
  { icon: Users, title: "Lingkungan Pendukung", desc: "Menjadi bagian dari jaringan penerima yang saling menguatkan dan berbagi pengalaman." },
  { icon: ShieldCheck, title: "Bukti Partisipasi", desc: "Sertifikat program sebagai dokumentasi pengalaman dan keikutsertaan penerima." },
];

export function CategoryPage({ kind, title, tagline, desc, registerTo, shareTo }: { kind: "prestasi" | "ekonomi"; title: string; tagline: string; desc: string; registerTo: "/pendaftaran/prestasi" | "/pendaftaran/ekonomi"; shareTo: "/bagikan-poster/prestasi" | "/bagikan-poster/ekonomi"; }) {
  const isGold = kind === "ekonomi";
  const Icon = isGold ? HeartHandshake : Trophy;
  const benefits = isGold ? benefitEkonomi : benefitPrestasi;
  return <>
    <section className="relative overflow-hidden border-b border-border bg-background">
      <div aria-hidden="true" className={`absolute -right-24 -top-24 h-96 w-96 rounded-full blur-3xl ${isGold ? "bg-gold/15" : "bg-primary/12"}`} />
      <div className="container-page relative py-12 md:py-16 lg:py-20">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary">← Kembali ke Beranda</Link>
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-center">
          <div className="max-w-3xl">
            <span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold ${isGold ? "border-gold/25 bg-gold/10 text-[oklch(0.55_0.16_75)]" : "border-primary/15 bg-primary-soft text-primary"}`}><Icon size={17} />{tagline}</span>
            <h1 className="mt-5 text-3xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-4xl lg:text-5xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">{desc}</p>
            <div className="mt-7 flex flex-wrap gap-3"><Link to={registerTo} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-soft hover:-translate-y-0.5">Mulai Pendaftaran <ArrowRight size={16} /></Link><Link to={shareTo} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3.5 text-sm font-semibold hover:border-primary/30 hover:text-primary"><Share2 size={16} /> Bagikan</Link></div>
          </div>
          <div className={`relative overflow-hidden rounded-[2rem] border p-6 shadow-soft ${isGold ? "border-gold/20 bg-gold/10" : "border-primary/15 bg-primary-soft"}`}><div className="flex items-center gap-4"><div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${isGold ? "bg-gold text-white" : "bg-primary text-primary-foreground"}`}><Icon size={27} /></div><div><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Jalur {isGold ? "Ekonomi" : "Prestasi"}</p><p className="mt-1 text-xl font-extrabold">Rp17 Juta</p><p className="text-xs text-muted-foreground">total dukungan / semester</p></div></div><div className="mt-6 grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl bg-background/75 p-3"><b className="block">4 Jenjang</b><span className="text-muted-foreground">SD–Mahasiswa</span></div><div className="rounded-xl bg-background/75 p-3"><b className="block">Rp0</b><span className="text-muted-foreground">biaya daftar</span></div></div></div>
        </div>
      </div>
    </section>

    <AdSlot placement="category_top" />

    <section className="container-page py-12 md:py-16">
      <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <section><div className="mb-6"><span className="text-[11px] font-bold uppercase tracking-wider text-primary">Persiapan</span><h2 className="mt-1 text-2xl font-extrabold md:text-3xl">Yang perlu kamu siapkan</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Poin penting sebelum mengisi formulir agar proses pendaftaran lebih lancar.</p></div><div className="grid gap-3 sm:grid-cols-2">{persyaratan.map((item, i) => <div key={item} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-soft"><span className="text-3xl font-black text-primary/10">{String(i + 1).padStart(2, "0")}</span><div className="mt-2 flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-primary" /><p className="text-sm leading-6 text-foreground/80">{item}</p></div></div>)}</div></section>
        <aside><div className="mb-6"><span className="text-[11px] font-bold uppercase tracking-wider text-primary">Nilai tambah</span><h2 className="mt-1 text-2xl font-extrabold md:text-3xl">Lebih dari sekadar bantuan</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Program dirancang agar pengalaman penerima tetap bernilai setelah seleksi.</p></div><div className="space-y-3">{benefits.map(({ icon: BenefitIcon, title: benefitTitle, desc: benefitDesc }, i) => <div key={benefitTitle} className="group flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-card transition duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-soft"><div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${isGold ? "bg-gold/15 text-[oklch(0.55_0.16_75)]" : "bg-primary-soft text-primary"}`}><BenefitIcon size={21} /></div><div className="min-w-0"><span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Benefit 0{i + 1}</span><h3 className="mt-0.5 font-bold">{benefitTitle}</h3><p className="mt-1 text-sm leading-5 text-muted-foreground">{benefitDesc}</p></div></div>)}</div></aside>
      </div>
    </section>

    <AdSlot placement="category_middle" />

    <section className="container-page py-4 md:py-8"><div className="grid gap-6 md:grid-cols-3"><Metric icon={<Wallet className="text-primary" size={22} />} title="Dukungan" value="Rp17 Juta" desc="maksimal total per semester" /><Metric icon={<Users className="text-primary" size={22} />} title="Cakupan" value="Nasional" desc="terbuka bagi peserta Indonesia" /><Metric icon={<ShieldCheck className="text-primary" size={22} />} title="Pendaftaran" value="Gratis" desc="tidak ada biaya pendaftaran" /></div></section>
    <AdSlot placement="category_after_info" />

    <section className="container-page py-12"><div className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-primary-soft p-7 md:p-10"><div aria-hidden="true" className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/15 blur-3xl" /><div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between"><div className="max-w-xl"><span className="text-[11px] font-bold uppercase tracking-wider text-primary">Langkah berikutnya</span><h2 className="mt-2 text-2xl font-extrabold md:text-3xl">Punya semangat untuk melangkah lebih jauh?</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Siapkan data terbaikmu, baca ketentuan, lalu mulai pendaftaran ketika sudah siap.</p></div><Link to={registerTo} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-soft hover:-translate-y-0.5">Daftar Sekarang <ArrowUpRight size={17} /></Link></div></div></section>
    <AdSlot placement="category_bottom" />
    <section className="container-page pb-16"><div className="rounded-[2rem] border border-border bg-card p-6 shadow-card md:flex md:items-center md:justify-between md:p-8"><div><span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Tahap lanjutan</span><h2 className="mt-1 text-xl font-bold">Sudah menyelesaikan pendaftaran?</h2><p className="mt-1 text-sm text-muted-foreground">Lanjutkan dengan menyiapkan dokumen pendukung jalur {isGold ? "Ekonomi" : "Prestasi"}.</p></div><Link to={kind === "prestasi" ? "/berkas/prestasi" : "/berkas/ekonomi"} className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold hover:border-primary/30 hover:text-primary md:mt-0"><FileText size={16} /> Upload Berkas</Link></div></section>
  </>;
}
function Metric({ icon, title, value, desc }: { icon: ReactNode; title: string; value: string; desc: string }) { return <div className="rounded-3xl border border-border bg-card p-6 shadow-card"><div>{icon}</div><p className="mt-5 text-xs font-semibold text-muted-foreground">{title}</p><p className="mt-1 text-2xl font-extrabold">{value}</p><p className="mt-1 text-sm text-muted-foreground">{desc}</p></div>; }
