import { Wallet, Award, Gift, Trophy, BookOpen, PlaySquare } from "lucide-react";

const benefits = [
  {
    icon: Wallet,
    title: "Beasiswa Tunai",
    desc: "Dana pendidikan hingga Rp23.000.000 per semester langsung ke penerima.",
    accent: "bg-primary text-primary-foreground",
  },
  {
    icon: Award,
    title: "Sertifikat Resmi",
    desc: "Sertifikat penerima beasiswa resmi dari Kejar Prestasi.",
    accent: "bg-[oklch(0.92_0.14_85)] text-gold-foreground",
  },
  {
    icon: Trophy,
    title: "Plakat Penghargaan",
    desc: "Plakat penghargaan eksklusif sebagai bentuk apresiasi atas prestasi penerima.",
    accent: "bg-primary-soft text-primary",
  },
  {
    icon: BookOpen,
    title: "E-Book Eksklusif",
    desc: "Akses E-Book eksklusif berisi materi pengembangan diri dan akademik.",
    accent: "bg-primary-soft text-primary",
  },
  {
    icon: PlaySquare,
    title: "Video Eksklusif",
    desc: "Konten video eksklusif berupa kelas inspiratif dan materi pembinaan.",
    accent: "bg-primary-soft text-primary",
  },
  {
    icon: Gift,
    title: "Merchandise Eksklusif",
    desc: "Kaos, block note, goodie bag, dan paket merchandise lainnya.",
    accent: "bg-primary-soft text-primary",
  },
];

export function BenefitsSection() {
  return (
    <section className="container-page py-20">
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
          Benefit Beasiswa
        </span>
        <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-foreground">
          Apa Saja yang Kamu Dapatkan?
        </h2>
        <p className="mt-3 text-muted-foreground">
          Bukan sekadar beasiswa tunai — kamu mendapatkan paket lengkap untuk mendukung
          perjalanan akademis dan pengembangan diri.
        </p>
      </div>

      <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {benefits.map((b) => (
          <div
            key={b.title}
            className="rounded-3xl border border-border bg-card p-6 shadow-card hover:shadow-soft hover:-translate-y-0.5 transition"
          >
            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${b.accent}`}>
              <b.icon size={20} />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">{b.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{b.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
