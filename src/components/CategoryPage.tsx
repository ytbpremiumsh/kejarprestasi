import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, HeartHandshake, Share2, Sparkles, Trophy, Wallet, Users, ShieldCheck, ArrowUpRight, X, CheckCircle2, Tablet, Clock3, Zap } from "lucide-react";
import { useState, type ReactNode } from "react";
import { AdSlot } from "@/components/ads/AdSlot";

const persyaratan = [
  "Warga Negara Indonesia dan berdomisili di Indonesia",
  "Terdaftar sebagai pelajar atau mahasiswa aktif",
  "Jenjang SD/MI, SMP/MTs, SMA/SMK/MA, hingga D3–S2",
  "Tidak ada batas minimum nilai rapor atau IPK",
  "Mengisi data pendaftaran dengan benar dan lengkap",
  "Mengikuti tahapan seleksi sesuai jadwal program",
];
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

type CategoryKind = "prestasi" | "ekonomi";
type RegistrationPath = "/pendaftaran/prestasi" | "/pendaftaran/ekonomi";
type SharePath = "/bagikan-poster/prestasi" | "/bagikan-poster/ekonomi";

export function CategoryPage({ kind, title, tagline, desc, registerTo, shareTo }: { kind: CategoryKind; title: string; tagline: string; desc: string; registerTo: RegistrationPath; shareTo: SharePath }) {
  const isGold = kind === "ekonomi";
  const Icon = isGold ? HeartHandshake : Trophy;
  const benefits = isGold ? benefitEkonomi : benefitPrestasi;
  const [showPaths, setShowPaths] = useState(false);
  return <>
    <section className="relative overflow-hidden border-b border-border bg-background"><div aria-hidden="true" className={`absolute -right-24 -top-24 h-96 w-96 rounded-full blur-3xl ${isGold ? "bg-gold/15" : "bg-primary/12"}`} /><div className="container-page relative py-12 md:py-16 lg:py-20"><Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary">← Kembali ke Beranda</Link><div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-center"><div className="max-w-3xl"><span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold ${isGold ? "border-gold/25 bg-gold/10 text-[oklch(0.55_0.16_75)]" : "border-primary/15 bg-primary-soft text-primary"}`}><Icon size={17} />{tagline}</span><h1 className="mt-5 text-3xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-4xl lg:text-5xl">{title}</h1><p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">{desc}</p><div className="mt-7 flex flex-wrap gap-3"><button type="button" onClick={() => setShowPaths(true)} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-soft transition hover:-translate-y-0.5 hover:opacity-95">Mulai Pendaftaran <ArrowRight size={16} /></button><Link to={shareTo} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3.5 text-sm font-semibold hover:border-primary/30 hover:text-primary"><Share2 size={16} /> Bagikan</Link></div></div><div className={`relative overflow-hidden rounded-[2rem] border p-6 shadow-soft ${isGold ? "border-gold/20 bg-gold/10" : "border-primary/15 bg-primary-soft"}`}><div className="flex items-center gap-4"><div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${isGold ? "bg-gold text-white" : "bg-primary text-primary-foreground"}`}><Icon size={27} /></div><div><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Jalur {isGold ? "Ekonomi" : "Prestasi"}</p><p className="mt-1 text-xl font-extrabold">Rp17 Juta</p><p className="text-xs text-muted-foreground">total dukungan / semester</p></div></div><div className="mt-6 grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl bg-background/75 p-3"><b className="block">4 Jenjang</b><span className="text-muted-foreground">SD–Mahasiswa</span></div><div className="rounded-xl bg-background/75 p-3"><b className="block">Rp0</b><span className="text-muted-foreground">jalur reguler</span></div></div></div></div></div></section>
    <AdSlot placement="category_top" />
    <section className="container-page py-12 md:py-16"><div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]"><section><div className="mb-6"><span className="text-[11px] font-bold uppercase tracking-wider text-primary">Persiapan</span><h2 className="mt-1 text-2xl font-extrabold md:text-3xl">Yang perlu kamu siapkan</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Poin penting sebelum mengisi formulir agar proses pendaftaran lebih lancar.</p></div><div className="grid gap-3 sm:grid-cols-2">{persyaratan.map((item, i) => <div key={item} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-soft"><span className="text-3xl font-black text-primary/10">{String(i + 1).padStart(2, "0")}</span><div className="mt-2 flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-primary" /><p className="text-sm leading-6 text-foreground/80">{item}</p></div></div>)}</div></section><aside><div className="mb-6"><span className="text-[11px] font-bold uppercase tracking-wider text-primary">Nilai tambah</span><h2 className="mt-1 text-2xl font-extrabold md:text-3xl">Lebih dari sekadar bantuan</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Program dirancang agar pengalaman penerima tetap bernilai setelah seleksi.</p></div><div className="space-y-3">{benefits.map(({ icon: BenefitIcon, title: benefitTitle, desc: benefitDesc }, i) => <div key={benefitTitle} className="group flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-card transition duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-soft"><div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${isGold ? "bg-gold/15 text-[oklch(0.55_0.16_75)]" : "bg-primary-soft text-primary"}`}><BenefitIcon size={21} /></div><div className="min-w-0"><span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Benefit 0{i + 1}</span><h3 className="mt-0.5 font-bold">{benefitTitle}</h3><p className="mt-1 text-sm leading-5 text-muted-foreground">{benefitDesc}</p></div></div>)}</div></aside></div></section>
    <AdSlot placement="category_middle" />
    <section className="container-page py-4 md:py-8"><div className="grid gap-6 md:grid-cols-3"><Metric icon={<Wallet className="text-primary" size={22} />} title="Dukungan" value="Rp17 Juta" desc="maksimal total per semester" /><Metric icon={<Users className="text-primary" size={22} />} title="Cakupan" value="Nasional" desc="terbuka bagi peserta Indonesia" /><Metric icon={<ShieldCheck className="text-primary" size={22} />} title="Pendaftaran" value="Gratis" desc="tersedia jalur reguler" /></div></section>
    <AdSlot placement="category_after_info" />
    <section className="container-page py-12"><div className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-primary-soft p-7 md:p-10"><div aria-hidden="true" className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/15 blur-3xl" /><div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between"><div className="max-w-xl"><span className="text-[11px] font-bold uppercase tracking-wider text-primary">Langkah berikutnya</span><h2 className="mt-2 text-2xl font-extrabold md:text-3xl">Punya semangat untuk melangkah lebih jauh?</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Siapkan data terbaikmu, baca ketentuan, lalu mulai pendaftaran ketika sudah siap.</p></div><button type="button" onClick={() => setShowPaths(true)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-soft hover:-translate-y-0.5">Daftar Sekarang <ArrowUpRight size={17} /></button></div></div></section>
    <AdSlot placement="category_bottom" />
    {showPaths && <RegistrationPathModal registerTo={registerTo} kind={kind} onClose={() => setShowPaths(false)} />}
  </>;
}

function RegistrationPathModal({ registerTo, kind, onClose }: { registerTo: RegistrationPath; kind: CategoryKind; onClose: () => void }) {
  const [selected, setSelected] = useState<"reguler" | "akselerasi" | "platinum">("reguler");
  const programName = kind === "prestasi" ? "Prestasi" : "Ekonomi";
  const paths = [
    {
      id: "reguler" as const,
      name: "Jalur Reguler",
      shortName: "Reguler",
      price: "Gratis",
      description: "Jalur pendaftaran standar tanpa biaya untuk mengikuti seluruh tahapan seleksi program.",
      icon: Clock3,
      theme: "regular",
      features: ["Pendaftaran tanpa biaya", "Mengikuti proses seleksi reguler", "Sertifikat peserta program", "E-Book Panduan Meraih Beasiswa", "E-Sheet Rencana Belajar & Target"],
    },
    {
      id: "akselerasi" as const,
      name: "Jalur Akselerasi",
      shortName: "Akselerasi",
      price: "Rp15.000",
      description: "Jalur percepatan dengan proses administrasi yang diprioritaskan secara otomatis.",
      icon: Zap,
      theme: "accent",
      badge: "REKOMENDASI",
      features: ["Berpeluang meraih dana pendidikan beasiswa", "Lolos administrasi secara otomatis", "Proses pendaftaran lebih cepat", "Sertifikat peserta program", "E-Book Strategi Menyusun Target Prestasi", "E-Sheet Planner Prestasi Mingguan"],
    },
    {
      id: "platinum" as const,
      name: "Jalur Akselerasi Platinum",
      shortName: "Platinum",
      price: "Rp45.000",
      description: "Jalur premium dengan seluruh kemudahan Akselerasi serta kesempatan mendapatkan Tablet Pendidikan.",
      icon: Tablet,
      theme: "premium",
      badge: "PREMIUM",
      features: ["Berpeluang meraih dana pendidikan beasiswa", "Lolos administrasi secara otomatis", "Proses pendaftaran diprioritaskan", "Sertifikat peserta program", "E-Book Masterplan Pendidikan & Prestasi", "E-Sheet Dashboard Target Belajar", "Kesempatan mendapatkan Tablet Pendidikan"],
    },
  ];
  const chosen = paths.find((p) => p.id === selected)!;
  const goNext = () => { window.location.href = `${registerTo}?jalur=${selected}`; };
  return <div className="fixed inset-0 z-[100] flex items-end justify-center bg-foreground/50 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="registration-path-title"><div className="relative max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-t-[2rem] border border-border bg-background p-4 shadow-2xl sm:rounded-[2rem] sm:p-7"><button type="button" onClick={onClose} aria-label="Tutup pilihan jalur" className="absolute right-4 top-4 z-10 rounded-full border border-border bg-card p-2 text-muted-foreground transition hover:text-foreground"><X size={19} /></button><div className="mx-auto max-w-2xl pr-10 text-center"><span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Pilih jalur pendaftaran</span><h2 id="registration-path-title" className="mt-3 text-2xl font-extrabold text-foreground md:text-3xl">Tentukan jalur Beasiswa {programName}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Pilih satu jalur yang paling sesuai sebelum melanjutkan ke formulir pendaftaran.</p></div><div className="mt-7 grid items-stretch gap-4 lg:grid-cols-3">{paths.map((path) => { const PathIcon = path.icon; const active = selected === path.id; const accent = path.theme === "accent"; const premium = path.theme === "premium"; return <button key={path.id} type="button" onClick={() => setSelected(path.id)} className={`relative flex min-h-[500px] flex-col overflow-hidden rounded-[1.7rem] border-2 bg-card p-5 text-left transition-all duration-200 sm:p-6 ${active ? premium ? "border-emerald-500 shadow-[0_18px_45px_rgba(16,185,129,0.16)]" : accent ? "border-amber-500 shadow-[0_18px_45px_rgba(245,158,11,0.14)]" : "border-primary shadow-soft" : premium ? "border-emerald-200 hover:border-emerald-400" : accent ? "border-amber-200 hover:border-amber-400" : "border-border hover:border-primary/30"}`}>{path.badge && <span className={`absolute right-0 top-0 rounded-bl-2xl px-4 py-2 text-[10px] font-extrabold tracking-wider text-white ${premium ? "bg-emerald-500" : "bg-amber-500"}`}>{path.badge}</span>}<div className="flex items-center justify-between"><span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${premium ? "bg-emerald-50 text-emerald-600" : accent ? "bg-amber-50 text-amber-600" : "bg-primary-soft text-primary"}`}><PathIcon size={25} /></span>{active && <CheckCircle2 size={21} className={premium ? "text-emerald-500" : accent ? "text-amber-500" : "text-primary"} />}</div><h3 className="mt-6 text-xl font-extrabold tracking-tight text-foreground">{path.name}</h3><p className="mt-2 min-h-[72px] text-sm leading-6 text-muted-foreground">{path.description}</p><div className="mt-4 space-y-2.5">{path.features.map((feature, index) => <div key={feature} className="flex items-start gap-2.5 text-sm leading-5 text-foreground/80"><CheckCircle2 size={17} className={`mt-0.5 shrink-0 ${premium ? "text-emerald-500" : accent ? "text-amber-500" : "text-primary"}`} /><span className={index === path.features.length - 1 && premium ? "font-bold" : ""}>{feature}</span>{index === path.features.length - 1 && premium && <span className="ml-auto shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700">KHUSUS</span>}</div>)}</div><div className={`mt-auto pt-6`}><div className={`rounded-2xl border p-4 text-center ${premium ? "border-emerald-100 bg-emerald-50" : accent ? "border-amber-100 bg-amber-50" : "border-border bg-secondary/50"}`}><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Biaya pendaftaran</p><p className={`mt-1 text-2xl font-extrabold ${premium ? "text-emerald-600" : accent ? "text-amber-700" : "text-primary"}`}>{path.price}</p></div><div className={`mt-3 flex items-center justify-center gap-2 rounded-full border-2 px-4 py-3 text-sm font-bold ${active ? premium ? "border-emerald-500 bg-emerald-500 text-white" : accent ? "border-amber-500 bg-amber-500 text-white" : "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground"}`}>{active ? "Jalur Dipilih" : `Pilih ${path.shortName}`} <ArrowRight size={16} /></div></div></button>; })}</div><div className="mt-5 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-card sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pilihan saat ini</p><p className="mt-1 font-bold text-foreground">{chosen.name} <span className="font-normal text-muted-foreground">· {chosen.price}</span></p></div><button type="button" onClick={goNext} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-soft transition hover:-translate-y-0.5">Lanjutkan ke Formulir <ArrowRight size={16} /></button></div></div></div>;
}

function Metric({ icon, title, value, desc }: { icon: ReactNode; title: string; value: string; desc: string }) { return <div className="rounded-3xl border border-border bg-card p-6 shadow-card"><div>{icon}</div><p className="mt-5 text-xs font-semibold text-muted-foreground">{title}</p><p className="mt-1 text-2xl font-extrabold">{value}</p><p className="mt-1 text-sm text-muted-foreground">{desc}</p></div>; }