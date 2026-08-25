import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, FileText, HeartHandshake, Share2, Sparkles, Trophy, Wallet, Users, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { AdSlot } from "@/components/ads/AdSlot";

const persyaratan = [
  "Warga Negara Indonesia dan berdomisili di Indonesia",
  "Terdaftar sebagai pelajar atau mahasiswa aktif",
  "Jenjang SD/MI, SMP/MTs, SMA/SMK/MA, hingga D3–S2",
  "Tidak ada batas minimum nilai rapor atau IPK",
  "Mengisi data pendaftaran dengan benar dan lengkap",
  "Mengikuti tahapan seleksi sesuai jadwal program",
];

const BENEFIT_IMAGE_URL = "https://zmlwicrlcuqgxfaskxic.supabase.co/storage/v1/object/public/admin-media/1778936443603-Benefit-Kejar-Prestasi--3.png";

const benefitPrestasi = [
  { icon: Trophy, title: "Dukungan Pendidikan", desc: "Bantuan beasiswa untuk membantu kebutuhan pendidikan selama satu semester." },
  { icon: Sparkles, title: "Apresiasi Prestasi", desc: "Pengakuan atas pencapaian akademik maupun non-akademik yang kamu miliki." },
  { icon: Users, title: "Jaringan Penerima", desc: "Kesempatan terhubung dengan pelajar dan mahasiswa berprestasi dari berbagai daerah." },
  { icon: ShieldCheck, title: "Sertifikat Program", desc: "Dokumen apresiasi sebagai bagian dari keikutsertaan dalam program beasiswa." },
];

const benefitEkonomi = [
  { icon: Wallet, title: "Bantuan Pendidikan", desc: "Dukungan finansial untuk membantu meringankan kebutuhan pendidikan penerima." },
  { icon: HeartHandshake, title: "Kesempatan yang Setara", desc: "Ruang bagi peserta dengan keterbatasan ekonomi untuk tetap mengejar pendidikan." },
  { icon: Users, title: "Komunitas Penerima", desc: "Bergabung dengan komunitas penerima beasiswa dan memperluas relasi positif." },
  { icon: ShieldCheck, title: "Sertifikat Program", desc: "Sertifikat sebagai bukti partisipasi dan penerimaan program beasiswa." },
];

export function CategoryPage({ kind, title, tagline, desc, registerTo, shareTo }: { kind: "prestasi" | "ekonomi"; title: string; tagline: string; desc: string; registerTo: "/pendaftaran/prestasi" | "/pendaftaran/ekonomi"; shareTo: "/bagikan-poster/prestasi" | "/bagikan-poster/ekonomi"; }) {
  const isGold = kind === "ekonomi";
  const Icon: ReactNode = isGold ? <HeartHandshake size={22} /> : <Trophy size={22} />;
  const benefits = isGold ? benefitEkonomi : benefitPrestasi;

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-background">
        <div aria-hidden="true" className={`absolute -top-28 right-0 h-80 w-80 rounded-full blur-3xl ${isGold ? "bg-gold/15" : "bg-primary/12"}`} />
        <div aria-hidden="true" className="absolute inset-0 opacity-[0.18]" style={{ backgroundImage: "linear-gradient(to right, color-mix(in oklab, var(--primary) 10%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--primary) 10%, transparent) 1px, transparent 1px)", backgroundSize: "48px 48px", maskImage: "linear-gradient(to bottom, black, transparent 80%)" }} />
        <div className="container-page relative py-12 md:py-16 lg:py-20">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-primary">← Kembali ke Beranda</Link>
          <div className="mt-8 grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div className="max-w-3xl">
              <span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold ${isGold ? "border-gold/25 bg-gold/10 text-[oklch(0.55_0.16_75)]" : "border-primary/15 bg-primary-soft text-primary"}`}>{Icon}{tagline}</span>
              <h1 className="mt-5 text-3xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-4xl lg:text-5xl">{title}</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">{desc}</p>
            </div>
            <Link to={shareTo} className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground shadow-card transition hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary"><Share2 size={16} /> Bagikan Program</Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard icon={<Wallet size={18} />} value="Rp17 Juta" label="Total / semester" />
            <StatCard icon={<Users size={18} />} value="4 Jenjang" label="SD hingga Mahasiswa" />
            <StatCard icon={<Check size={18} />} value="Rp0" label="Biaya pendaftaran" />
            <StatCard icon={Icon} value="Nasional" label="Terbuka di Indonesia" />
          </div>
        </div>
      </section>

      <section className="container-page py-12 md:py-16">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <InfoCard eyebrow="Yang perlu disiapkan" title="Persyaratan Program" icon={<Check size={19} />}>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {persyaratan.map((item, i) => (
                <div key={item} className="group flex gap-3 rounded-2xl border border-border bg-background p-4 transition hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-card">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${isGold ? "bg-gold/15 text-[oklch(0.55_0.16_75)]" : "bg-primary-soft text-primary"}`}>{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-sm leading-5 text-foreground/80">{item}</span>
                </div>
              ))}
            </div>
            <div className={`mt-6 rounded-2xl p-5 ${isGold ? "bg-gold/10" : "bg-primary-soft"}`}>
              <p className="text-sm font-bold text-foreground">Catatan penting</p>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">Tidak perlu membayar biaya pendaftaran. Pastikan informasi yang dikirim sesuai kondisi sebenarnya agar proses verifikasi berjalan lancar.</p>
            </div>
          </InfoCard>

          <InfoCard eyebrow="Apa yang kamu dapatkan" title="Benefit Penerima" icon={isGold ? <HeartHandshake size={19} /> : <Trophy size={19} />}>
            <div className="mt-6 space-y-3">
              {benefits.map(({ icon: BenefitIcon, title: benefitTitle, desc: benefitDesc }) => (
                <div key={benefitTitle} className="flex gap-4 rounded-2xl border border-border bg-background p-4 transition hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-card">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${isGold ? "bg-gold/15 text-[oklch(0.55_0.16_75)]" : "bg-primary-soft text-primary"}`}><BenefitIcon size={20} /></div>
                  <div><h3 className="font-bold text-foreground">{benefitTitle}</h3><p className="mt-1 text-sm leading-5 text-muted-foreground">{benefitDesc}</p></div>
                </div>
              ))}
            </div>
            <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-secondary/30"><img src={BENEFIT_IMAGE_URL} alt="Informasi benefit program Kejar Prestasi" loading="lazy" decoding="async" width={1200} height={800} className="h-auto w-full object-cover" /></div>
          </InfoCard>
        </div>
      </section>

      <AdSlot placement="category_middle" />

      <section className="container-page pb-10">
        <div className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-primary-soft p-7 md:p-9">
          <div aria-hidden="true" className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl"><span className="text-xs font-bold uppercase tracking-wider text-primary">Langkah berikutnya</span><h2 className="mt-2 text-2xl font-extrabold text-foreground">Siap menjadi bagian dari program ini?</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Isi formulir secara bertahap dan pastikan data yang kamu masukkan sudah sesuai sebelum dikirim.</p></div>
            <Link to={registerTo} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-soft transition hover:-translate-y-0.5 hover:opacity-95">Mulai Pendaftaran <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="flex flex-col gap-5 rounded-[2rem] border border-border bg-card p-7 shadow-card md:flex-row md:items-center md:justify-between md:p-8">
          <div><span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sudah mendaftar?</span><h2 className="mt-1 text-xl font-bold text-foreground">Lengkapi dokumen pendukungmu</h2><p className="mt-1 text-sm text-muted-foreground">Unggah berkas untuk jalur {isGold ? "Ekonomi" : "Prestasi"} setelah proses pendaftaran.</p></div>
          <Link to={kind === "prestasi" ? "/berkas/prestasi" : "/berkas/ekonomi"} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:text-primary"><FileText size={16} /> Upload Berkas</Link>
        </div>
      </section>

      <AdSlot placement="category_bottom" />
    </>
  );
}

function StatCard({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return <div className="rounded-2xl border border-border bg-card p-4 shadow-card"><div className="flex items-center gap-2 text-primary">{icon}<span className="text-xs font-semibold text-muted-foreground">{label}</span></div><p className="mt-2 text-lg font-extrabold text-foreground md:text-xl">{value}</p></div>;
}

function InfoCard({ eyebrow, title, icon, children }: { eyebrow: string; title: string; icon: ReactNode; children: ReactNode }) {
  return <div className="rounded-[2rem] border border-border bg-card p-6 shadow-card md:p-8"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">{icon}</div><div><span className="text-[11px] font-bold uppercase tracking-wider text-primary">{eyebrow}</span><h2 className="mt-1 text-2xl font-extrabold text-foreground">{title}</h2></div></div>{children}</div>;
}
