import { useState } from "react";
import { GraduationCap, Backpack, Wallet, CheckCircle2, Sparkles } from "lucide-react";

type Kategori = {
  key: string;
  label: string;
  icon: React.ReactNode;
  nominal: string;
  periode: string;
  highlight: string;
  fakta: string[];
};

const data: Kategori[] = [
  {
    key: "pelajar",
    label: "Pelajar",
    icon: <Backpack size={20} />,
    nominal: "Rp800.000",
    periode: "per semester",
    highlight: "Untuk jenjang SD, SMP, dan SMA/SMK/MA",
    fakta: [
      "Berlaku untuk seluruh sekolah di Indonesia",
      "Tanpa minimal nilai rapor",
      "Jalur prestasi & ekonomi tersedia",
    ],
  },
  {
    key: "mahasiswa",
    label: "Mahasiswa",
    icon: <GraduationCap size={20} />,
    nominal: "Rp1.000.000",
    periode: "per semester",
    highlight: "Mendukung biaya kuliah, buku, dan kebutuhan akademik",
    fakta: [
      "Berlaku untuk PTN/PTS di Indonesia",
      "Tanpa minimal IPK",
      "Bonus mentoring & pembinaan penerima",
    ],
  },
];

export function InfoBeasiswaInteraktif() {
  const [active, setActive] = useState<string>("pelajar");
  const current = data.find((d) => d.key === active)!;

  return (
    <section className="py-4">
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles size={14} /> Nominal Bantuan
        </span>
        <h2 className="mt-3 text-2xl md:text-3xl font-extrabold text-foreground">
          Besaran Beasiswa per Kategori
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Pilih kategori untuk melihat detail dukungan yang akan diterima.
        </p>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {data.map((d) => {
          const isActive = active === d.key;
          return (
            <button
              key={d.key}
              onClick={() => setActive(d.key)}
              className={`group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold border transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-soft scale-105"
                  : "bg-card text-foreground border-border hover:border-primary hover:text-primary"
              }`}
            >
              <span className={isActive ? "text-primary-foreground" : "text-primary"}>
                {d.icon}
              </span>
              {d.label}
            </button>
          );
        })}
      </div>

      {/* Detail card */}
      <div
        key={current.key}
        className="mt-6 grid md:grid-cols-[1.1fr_1fr] gap-6 rounded-3xl border border-border bg-card p-6 md:p-8 shadow-card animate-in fade-in slide-in-from-bottom-2 duration-500"
      >
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            <Wallet size={14} /> Nominal Bantuan
          </span>
          <div className="mt-4 flex items-end gap-2">
            <span className="text-4xl md:text-5xl font-extrabold text-foreground">
              {current.nominal}
            </span>
            <span className="pb-1 text-sm text-muted-foreground">{current.periode}</span>
          </div>
          <p className="mt-3 text-muted-foreground">{current.highlight}</p>
        </div>

        <div className="rounded-2xl bg-primary-soft/50 p-6 border border-primary/10">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
            Fakta {current.label}
          </h3>
          <ul className="mt-4 space-y-3">
            {current.fakta.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-foreground/85">
                <CheckCircle2 size={18} className="mt-0.5 text-primary shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
