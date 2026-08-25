import { Wallet, Award, Gift, PlayCircle, Users, Briefcase } from "lucide-react";

const benefits = [
  {
    icon: Wallet,
    title: "Dana Pendidikan Beasiswa",
    desc: "Bantuan dana pendidikan hingga Rp17.000.000 per semester untuk penerima.",
    accent: "bg-primary text-primary-foreground",
  },
  {
    icon: PlayCircle,
    title: "Video Motivasi",
    desc: 'Video eksklusif "Menghadapi Tantangan dan Meraih Keberhasilan dalam Studi".',
    accent: "bg-[oklch(0.92_0.14_85)] text-gold-foreground",
  },
  {
    icon: Gift,
    title: "Merchandise Menarik",
    desc: "Paket merchandise eksklusif dari Kejar Prestasi: kaos, block note, goodie bag, dan lainnya.",
    accent: "bg-primary-soft text-primary",
  },
  {
    icon: Award,
    title: "Sertifikat Beasiswa",
    desc: "Sertifikat resmi penerima beasiswa langsung dari Kejar Prestasi.",
    accent: "bg-primary-soft text-primary",
  },
  {
    icon: Users,
    title: "Kontingen Ambassador",
    desc: "Peluang menjadi Kontingen Ambassador Program Kejar Prestasi.",
    accent: "bg-primary-soft text-primary",
  },
  {
    icon: Briefcase,
    title: "Akses Magang",
    desc: "Kesempatan magang di Kejar Prestasi Indonesia dan jaringan partner.",
    accent: "bg-primary-soft text-primary",
  },
];

export function BenefitsSection() {
  return (
    <section className="container-page py-20">
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-block rounded-full border border-primary/15 bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          Benefit Beasiswa
        </span>
        <h2 className="mt-4 text-3xl md:text-[2.6rem] font-extrabold leading-[1.1] text-foreground">
          Apa Saja yang Kamu Dapatkan?
        </h2>
        <span aria-hidden="true" className="mt-4 mx-auto block h-1 w-16 rounded-full bg-gradient-to-r from-primary to-gold" />
        <p className="mt-4 text-muted-foreground">
          Bukan sekadar beasiswa tunai — kamu mendapatkan paket lengkap untuk mendukung
          perjalanan akademis dan pengembangan diri.
        </p>
      </div>

      <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {benefits.map((b) => (
          <div
            key={b.title}
            className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-card hover:shadow-soft hover:-translate-y-1 transition duration-300"
          >
            <span aria-hidden="true" className="absolute inset-x-0 -bottom-px h-1 scale-x-0 bg-gradient-to-r from-primary to-gold transition-transform duration-300 group-hover:scale-x-100" />
            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl shadow-card ${b.accent}`}>
              <b.icon size={20} />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">{b.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

