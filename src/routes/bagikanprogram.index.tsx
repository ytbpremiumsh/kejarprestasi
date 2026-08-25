import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, HeartHandshake, ImagePlus, Instagram, Trophy, Users } from "lucide-react";

export const Route = createFileRoute("/bagikanprogram/")({
  head: () => ({
    meta: [
      { title: "Bagikan Twibbon & Poster — Kejar Prestasi" },
      { name: "description", content: "Buat Twibbon pribadi dan bagikan poster resmi Kejar Prestasi sesuai kategori beasiswa." },
    ],
  }),
  component: BagikanProgramSelector,
});

function BagikanProgramSelector() {
  return (
    <main className="container-page py-14 md:py-20">
      <header className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3.5 py-1.5 text-xs font-bold text-primary">
          <ImagePlus size={14} /> Bagikan Program
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">Twibbon untuk Instagram, Poster untuk 5 Grup</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">Pilih kategori beasiswa yang kamu ikuti. Kamu akan membuat Twibbon dari foto sendiri menggunakan frame resmi, lalu membagikan poster program ke minimal 5 grup.</p>
      </header>

      <section className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-2">
        <ProgramCard to="/bagikanprogram/prestasi" icon={<Trophy size={24} />} title="Beasiswa Prestasi" desc="Buat Twibbon Prestasi, bagikan ke Instagram, lalu sebarkan poster ke 5 grup." />
        <ProgramCard to="/bagikanprogram/ekonomi" icon={<HeartHandshake size={24} />} title="Beasiswa Ekonomi" desc="Buat Twibbon Ekonomi, bagikan ke Instagram, lalu sebarkan poster ke 5 grup." />
      </section>

      <section className="mx-auto mt-8 grid max-w-5xl gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4 text-sm text-foreground/80"><Instagram size={18} className="mb-2 text-primary" /><b>Twibbon:</b> unggah ke Instagram menggunakan caption resmi.</div>
        <div className="rounded-2xl border border-border bg-card p-4 text-sm text-foreground/80"><Users size={18} className="mb-2 text-primary" /><b>Poster:</b> bagikan ke minimal 5 grup WhatsApp/komunitas yang berbeda.</div>
      </section>
    </main>
  );
}

function ProgramCard({ to, icon, title, desc }: { to: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link to={to as any} className="group relative overflow-hidden rounded-[2rem] border border-border bg-card p-7 shadow-card transition hover:-translate-y-1 hover:border-primary/25 hover:shadow-soft">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">{icon}</div>
      <h2 className="mt-6 text-2xl font-extrabold text-foreground">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{desc}</p>
      <div className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-primary">Mulai Bagikan Program <ArrowRight size={16} className="transition group-hover:translate-x-1" /></div>
    </Link>
  );
}
