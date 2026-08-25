import { Award, BookOpen, Wallet } from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Dana Pendidikan",
    desc: "Bantuan beasiswa hingga Rp17.000.000 per semester langsung ke penerima yang lolos seleksi.",
  },
  {
    icon: BookOpen,
    title: "Akses Terbuka",
    desc: "Terbuka untuk SD, SMP, SMA/SMK/MA, dan Mahasiswa di seluruh Indonesia.",
  },
  {
    icon: Award,
    title: "Apresiasi Prestasi",
    desc: "Mengapresiasi pelajar berprestasi akademik maupun non-akademik tanpa minimal nilai.",
  },
];

export function AboutMockup() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary-soft/40 to-transparent" />
      <div className="container-page relative py-20">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-block rounded-full border border-primary/15 bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Tentang Program
          </span>
          <h2 className="mt-4 text-3xl md:text-[2.6rem] font-extrabold leading-[1.1] text-foreground">
            Apa itu Beasiswa Kejar Prestasi?
          </h2>
          <span aria-hidden="true" className="mt-4 mx-auto block h-1 w-16 rounded-full bg-gradient-to-r from-primary to-gold" />
          <p className="mt-4 text-muted-foreground">
            Program beasiswa pendidikan nasional untuk mendukung pelajar Indonesia meraih
            mimpi akademis dan non-akademis. Berbasis prestasi dan kebutuhan ekonomi,
            dijalankan secara transparan dan tanpa biaya pendaftaran.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-soft hover:-translate-y-1 transition duration-300"
            >
              <span aria-hidden="true" className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition" />
              <div className="relative flex items-center justify-between">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary group-hover:scale-105 transition">
                  <f.icon size={20} />
                </div>
                <span className="text-3xl font-extrabold text-primary/10 tabular-nums">0{i + 1}</span>
              </div>
              <h3 className="relative mt-4 text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="relative mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

