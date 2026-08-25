import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, BadgeCheck, Check, Clock3, Crown, Gift, HeartHandshake, Share2, ShieldCheck, Sparkles, Tablet, Trophy, Users, Wallet, X, Zap } from "lucide-react";
import { useState, type ReactNode } from "react";
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

type CategoryKind = "prestasi" | "ekonomi";
type RegistrationPath = "/pendaftaran/prestasi" | "/pendaftaran/ekonomi";
type SharePath = "/bagikan-poster/prestasi" | "/bagikan-poster/ekonomi";
type PathId = "reguler" | "akselerasi" | "platinum";

export function CategoryPage({ kind, title, tagline, desc, registerTo, shareTo }: { kind: CategoryKind; title: string; tagline: string; desc: string; registerTo: RegistrationPath; shareTo: SharePath }) {
  const isGold = kind === "ekonomi";
  const Icon = isGold ? HeartHandshake : Trophy;
  const benefits = isGold ? benefitEkonomi : benefitPrestasi;
  const [showPaths, setShowPaths] = useState(false);

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
            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" onClick={() => setShowPaths(true)} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-soft transition hover:-translate-y-0.5 hover:opacity-95">Mulai Pendaftaran <ArrowRight size={16} /></button>
              <Link to={shareTo} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3.5 text-sm font-semibold hover:border-primary/30 hover:text-primary"><Share2 size={16} /> Bagikan</Link>
            </div>
          </div>
          <div className={`relative overflow-hidden rounded-[2rem] border p-6 shadow-soft ${isGold ? "border-gold/20 bg-gold/10" : "border-primary/15 bg-primary-soft"}`}>
            <div className="flex items-center gap-4"><div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${isGold ? "bg-gold text-white" : "bg-primary text-primary-foreground"}`}><Icon size={27} /></div><div><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Jalur {isGold ? "Ekonomi" : "Prestasi"}</p><p className="mt-1 text-xl font-extrabold">Rp17 Juta</p><p className="text-xs text-muted-foreground">total dukungan / semester</p></div></div>
            <div className="mt-6 grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl bg-background/75 p-3"><b className="block">4 Jenjang</b><span className="text-muted-foreground">SD–Mahasiswa</span></div><div className="rounded-xl bg-background/75 p-3"><b className="block">Rp0</b><span className="text-muted-foreground">jalur reguler</span></div></div>
          </div>
        </div>
      </div>
    </section>

    <AdSlot placement="category_top" />

    <section className="container-page py-12 md:py-16">
      <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <section>
          <div className="mb-6"><span className="text-[11px] font-bold uppercase tracking-wider text-primary">Persiapan</span><h2 className="mt-1 text-2xl font-extrabold md:text-3xl">Yang perlu kamu siapkan</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Poin penting sebelum mengisi formulir agar proses pendaftaran lebih lancar.</p></div>
          <div className="grid gap-3 sm:grid-cols-2">{persyaratan.map((item, i) => <div key={item} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-soft"><span className="text-3xl font-black text-primary/10">{String(i + 1).padStart(2, "0")}</span><div className="mt-2 flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-primary" /><p className="text-sm leading-6 text-foreground/80">{item}</p></div></div>)}</div>
        </section>
        <aside>
          <div className="mb-6"><span className="text-[11px] font-bold uppercase tracking-wider text-primary">Nilai tambah</span><h2 className="mt-1 text-2xl font-extrabold md:text-3xl">Lebih dari sekadar bantuan</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Program dirancang agar pengalaman penerima tetap bernilai setelah seleksi.</p></div>
          <div className="space-y-3">{benefits.map(({ icon: BenefitIcon, title: benefitTitle, desc: benefitDesc }, i) => <div key={benefitTitle} className="group flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-card transition duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-soft"><div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${isGold ? "bg-gold/15 text-[oklch(0.55_0.16_75)]" : "bg-primary-soft text-primary"}`}><BenefitIcon size={21} /></div><div className="min-w-0"><span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Benefit 0{i + 1}</span><h3 className="mt-0.5 font-bold">{benefitTitle}</h3><p className="mt-1 text-sm leading-5 text-muted-foreground">{benefitDesc}</p></div></div>)}</div>
        </aside>
      </div>
    </section>

    <AdSlot placement="category_middle" />
    <section className="container-page py-4 md:py-8"><div className="grid gap-6 md:grid-cols-3"><Metric icon={<Wallet className="text-primary" size={22} />} title="Dukungan" value="Rp17 Juta" desc="maksimal total per semester" /><Metric icon={<Users className="text-primary" size={22} />} title="Cakupan" value="Nasional" desc="terbuka bagi peserta Indonesia" /><Metric icon={<ShieldCheck className="text-primary" size={22} />} title="Pendaftaran" value="Gratis" desc="tersedia jalur reguler" /></div></section>
    <AdSlot placement="category_after_info" />

    <section className="container-page py-12">
      <div className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-primary-soft p-7 md:p-10"><div aria-hidden="true" className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/15 blur-3xl" /><div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between"><div className="max-w-xl"><span className="text-[11px] font-bold uppercase tracking-wider text-primary">Langkah berikutnya</span><h2 className="mt-2 text-2xl font-extrabold md:text-3xl">Punya semangat untuk melangkah lebih jauh?</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Siapkan data terbaikmu, baca ketentuan, lalu pilih jalur pendaftaran yang paling sesuai.</p></div><button type="button" onClick={() => setShowPaths(true)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-soft hover:-translate-y-0.5">Daftar Sekarang <ArrowUpRight size={17} /></button></div></div>
    </section>
    <AdSlot placement="category_bottom" />
    {showPaths && <RegistrationPathModal registerTo={registerTo} kind={kind} onClose={() => setShowPaths(false)} />}
  </>;
}

function RegistrationPathModal({ registerTo, kind, onClose }: { registerTo: RegistrationPath; kind: CategoryKind; onClose: () => void }) {
  const programName = kind === "prestasi" ? "Prestasi" : "Ekonomi";
  const paths = [
    { id: "reguler" as PathId, name: "Jalur Reguler", price: "Gratis", icon: Clock3, theme: "regular" as const, description: "Jalur standar tanpa biaya untuk peserta yang ingin mengikuti seluruh proses sesuai ketentuan.", features: ["Wajib membagikan Twibbon Program", "Wajib membagikan Poster Program", "Wajib Follow Instagram Resmi Program Beasiswa"] },
    { id: "akselerasi" as PathId, name: "Jalur Akselerasi", price: "Rp15.000", icon: Zap, theme: "accent" as const, badge: "REKOMENDASI", description: "Pilihan praktis dengan proses yang lebih ringkas dan prioritas layanan pendaftaran.", highlight: "Lolos administrasi secara otomatis", features: ["Berkesempatan meraih dana pendidikan beasiswa", "Proses pendaftaran lebih cepat", "Sertifikat peserta program", "E-Book Strategi Menyusun Target Prestasi", "E-Sheet Planner Prestasi Mingguan"] },
    { id: "platinum" as PathId, name: "Jalur Akselerasi Platinum", price: "Rp45.000", icon: Crown, theme: "premium" as const, badge: "PREMIUM", description: "Pilihan paling lengkap dengan kemudahan Akselerasi dan kesempatan benefit eksklusif untuk Awardee.", highlight: "Lolos administrasi secara otomatis", features: ["Mendapatkan Dana Pendidikan", "Proses pendaftaran diprioritaskan", "Sertifikat peserta program", "E-Book Masterplan Pendidikan & Prestasi", "E-Sheet Dashboard Target Belajar"] },
  ];

  return <div className="fixed inset-0 z-[100] flex items-end justify-center bg-foreground/55 backdrop-blur-sm sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="registration-path-title">
    <div className="relative max-h-[96vh] w-full max-w-7xl overflow-y-auto rounded-t-[2rem] border border-border bg-background px-4 pb-28 pt-5 shadow-2xl sm:rounded-[2rem] sm:p-7">
      <button type="button" onClick={onClose} aria-label="Tutup pilihan jalur" className="absolute right-4 top-4 z-20 rounded-full border border-border bg-card p-2 text-muted-foreground shadow-sm transition hover:text-foreground"><X size={19} /></button>
      <div className="mx-auto max-w-2xl pr-10 text-center"><span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Pilih jalur pendaftaran</span><h2 id="registration-path-title" className="mt-3 text-2xl font-extrabold text-foreground md:text-3xl">Tentukan jalur Beasiswa {programName}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Biaya kini tampil di bagian atas card agar langsung terlihat sebelum peserta membaca benefit.</p></div>

      <div className="mt-8 grid items-stretch gap-5 lg:grid-cols-3">
        {paths.map((path) => {
          const PathIcon = path.icon;
          const accent = path.theme === "accent";
          const premium = path.theme === "premium";
          const target = `${registerTo}?jalur=${path.id}` as RegistrationPath;
          const buttonLabel = path.id === "platinum" ? "Daftar Platinum" : path.id === "akselerasi" ? "Daftar Akselerasi" : "Pilih Reguler";
          return <article key={path.id} className={`relative flex min-h-[610px] flex-col overflow-hidden rounded-[2rem] border bg-card p-5 shadow-[0_18px_55px_rgba(15,23,42,.08)] transition duration-300 hover:-translate-y-1 sm:p-6 ${premium ? "border-emerald-200" : accent ? "border-amber-300" : "border-border"}`}>
            {path.badge && <span className={`absolute right-0 top-0 rounded-bl-[1.4rem] px-5 py-2.5 text-[10px] font-black tracking-[0.12em] text-white ${premium ? "bg-gradient-to-r from-emerald-600 to-emerald-500" : "bg-gradient-to-r from-amber-500 to-orange-500"}`}>{path.badge}</span>}

            <div className="flex items-center justify-between gap-4 pr-24">
              <div className={`grid h-14 w-14 place-items-center rounded-2xl border shadow-[0_10px_22px_rgba(15,23,42,.12),inset_0_1px_1px_rgba(255,255,255,.85)] ${premium ? "border-emerald-100 bg-emerald-50 text-emerald-600" : accent ? "border-amber-100 bg-amber-50 text-amber-600" : "border-primary/10 bg-primary-soft text-primary"}`}><PathIcon size={25} /></div>
            </div>
            <h3 className="mt-6 text-xl font-extrabold text-foreground">{path.name}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{path.description}</p>

            <div className={`mt-5 flex items-center justify-between rounded-2xl border p-4 ${premium ? "border-emerald-200 bg-emerald-50/70" : accent ? "border-amber-200 bg-amber-50/70" : "border-border bg-secondary/35"}`}>
              <div><p className={`text-[10px] font-extrabold uppercase tracking-[0.14em] ${premium ? "text-emerald-700" : accent ? "text-amber-700" : "text-primary"}`}>Biaya Pendaftaran</p><p className={`mt-1 text-2xl font-black ${premium ? "text-emerald-700" : accent ? "text-orange-600" : "text-primary"}`}>{path.price}</p></div>
              <span className={`grid h-11 w-11 place-items-center rounded-xl border shadow-sm ${premium ? "border-emerald-200 bg-white text-emerald-600" : accent ? "border-amber-200 bg-white text-amber-600" : "border-primary/10 bg-white text-primary"}`}>{premium ? <Crown size={20}/> : accent ? <Wallet size={20}/> : <BadgeCheck size={20}/>}</span>
            </div>

            {premium && <div className="mt-4 rounded-2xl border border-emerald-400 bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 p-3.5 text-white shadow-[0_14px_32px_rgba(5,150,105,.25)]"><div className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15"><Gift size={18}/></span><div><span className="text-[9px] font-black uppercase tracking-[0.14em] text-emerald-100">Benefit Platinum</span><p className="mt-0.5 text-sm font-extrabold leading-5">Tablet Pendidikan untuk Awardee</p><p className="mt-0.5 text-[11px] leading-4 text-emerald-100/90">Khusus peserta Platinum yang terpilih sebagai Awardee.</p></div></div></div>}

            {path.highlight && <div className={`mt-4 rounded-xl border px-4 py-3 ${premium ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}><p className={`flex items-center gap-2 text-sm font-extrabold ${premium ? "text-emerald-700" : "text-amber-700"}`}><Check size={16}/> {path.highlight}</p></div>}

            <div className="mt-5 space-y-3">{path.features.map(feature => <div key={feature} className="flex gap-2.5 text-sm leading-5 text-foreground/80"><span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-white ${premium ? "bg-emerald-500" : accent ? "bg-amber-500" : "bg-primary"}`}><Check size={12}/></span><span>{feature}</span></div>)}</div>

            <div className="mt-auto hidden pt-7 sm:block"><Link to={target} onClick={onClose} className={`group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-5 py-4 text-sm font-black transition hover:-translate-y-0.5 ${premium ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-[0_10px_24px_rgba(5,150,105,.28)]" : accent ? "bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-[0_10px_24px_rgba(245,158,11,.28)]" : "border-2 border-primary bg-background text-primary"}`}>{buttonLabel}<ArrowRight size={17}/>{(premium || accent) && <Sparkles size={15} className="absolute right-4 opacity-70"/>}</Link></div>
          </article>;
        })}
      </div>

      <div className="mt-5 hidden rounded-2xl border border-border bg-card p-4 text-xs text-muted-foreground sm:flex sm:items-center sm:justify-between sm:gap-4"><span className="flex items-center gap-2"><ShieldCheck size={16} className="text-primary"/>Semua jalur tetap memiliki kesempatan mengikuti program sesuai ketentuan.</span><span className="font-semibold text-foreground">Pilih sesuai kebutuhanmu.</span></div>

      <div className="fixed inset-x-0 bottom-0 z-[120] border-t border-border bg-background/95 p-3 shadow-[0_-12px_30px_rgba(15,23,42,.12)] backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto pb-[env(safe-area-inset-bottom)]">
          {paths.map(path => { const premium=path.theme==="premium", accent=path.theme==="accent", target=`${registerTo}?jalur=${path.id}` as RegistrationPath; return <Link key={path.id} to={target} onClick={onClose} className={`flex min-w-[118px] flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-3 text-xs font-black ${premium?"bg-emerald-600 text-white":accent?"bg-orange-500 text-white":"border-2 border-primary bg-background text-primary"}`}>{path.id==="platinum"?"Platinum":path.id==="akselerasi"?"Akselerasi":"Reguler"}<ArrowRight size={13}/></Link>})}
        </div>
      </div>
    </div>
  </div>;
}

function Metric({ icon, title, value, desc }: { icon: ReactNode; title: string; value: string; desc: string }) { return <div className="rounded-3xl border border-border bg-card p-6 shadow-card"><div>{icon}</div><p className="mt-5 text-xs font-semibold text-muted-foreground">{title}</p><p className="mt-1 text-2xl font-extrabold">{value}</p><p className="mt-1 text-sm text-muted-foreground">{desc}</p></div>; }
