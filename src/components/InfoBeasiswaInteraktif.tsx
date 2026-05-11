import { useState } from "react";
import { GraduationCap, BookOpen, School, Backpack, Wallet, Users, CheckCircle2, Sparkles } from "lucide-react";

type Jenjang = {
  key: string;
  label: string;
  icon: React.ReactNode;
  nominal: string;
  periode: string;
  highlight: string;
  fakta: string[];
};

const data: Jenjang[] = [
  {
    key: "sd",
    label: "SD",
    icon: <Backpack size={20} />,
    nominal: "Rp800.000",
    periode: "per semester",
    highlight: "Membantu kebutuhan sekolah dasar",
    fakta: [
      "Untuk siswa SD kelas 1–6",
      "Tanpa minimal nilai rapor",
      "Berlaku seluruh Indonesia",
    ],
  },
  {
    key: "smp",
    label: "SMP",
    icon: <BookOpen size={20} />,
    nominal: "Rp800.000",
    periode: "per semester",
    highlight: "Mendukung transisi ke jenjang menengah",
    fakta: [
      "Untuk siswa SMP/MTs kelas 7–9",
      "Akademik & non-akademik",
      "Tanpa biaya pendaftaran",
    ],
  },
  {
    key: "sma",
    label: "SMA / SMK / MA",
    icon: <School size={20} />,
    nominal: "Rp800.000",
    periode: "per semester",
    highlight: "Persiapan menuju kuliah & dunia kerja",
    fakta: [
      "Semua jurusan diterima",
      "Prestasi & jalur ekonomi",
      "Disertai sertifikat resmi",
    ],
  },
  {
    key: "mhs",
    label: "Mahasiswa S1",
    icon: <GraduationCap size={20} />,
    nominal: "Rp1.000.000",
    periode: "per semester",
    highlight: "Mendukung biaya kuliah & buku",
    fakta: [
      "Seluruh PTN/PTS di Indonesia",
      "Tanpa minimal IPK",
      "Bonus mentoring & komunitas",
    ],
  },
];

export function InfoBeasiswaInteraktif() {
  const [active, setActive] = useState<string>("sd");
  const current = data.find((d) => d.key === active)!;

  return (
    <section className="container-page py-20">
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles size={14} /> Informasi Beasiswa
        </span>
        <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-foreground">
          Nominal Beasiswa per Jenjang Pendidikan
        </h2>
        <p className="mt-3 text-muted-foreground">
          Pilih jenjangmu dan lihat detail dukungan beasiswa yang akan diterima.
        </p>
      </div>

      {/* Tabs */}
      <div className="mt-10 flex flex-wrap justify-center gap-2">
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
        className="mt-8 grid md:grid-cols-[1.1fr_1fr] gap-6 rounded-3xl border border-border bg-card p-8 md:p-10 shadow-card animate-in fade-in slide-in-from-bottom-2 duration-500"
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

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat icon={<Users size={16} />} label="Penerima" value="500+" />
            <Stat icon={<GraduationCap size={16} />} label="Section" value="#3 / 2026" />
          </div>
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

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-1 text-base font-bold text-foreground">{value}</div>
    </div>
  );
}
