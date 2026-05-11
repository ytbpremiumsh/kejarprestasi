import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/artikel")({
  head: () => ({
    meta: [
      { title: "Artikel — Kejar Prestasi" },
      { name: "description", content: "Kumpulan artikel seputar beasiswa Kejar Prestasi, tips persiapan, dan kisah inspiratif." },
      { property: "og:title", content: "Artikel — Kejar Prestasi" },
      { property: "og:description", content: "Kumpulan artikel seputar beasiswa Kejar Prestasi." },
    ],
  }),
  component: ArtikelPage,
});

const articles = [
  { title: "Tips Lolos Seleksi Beasiswa Prestasi", excerpt: "Strategi persiapan berkas, motivasi, dan wawancara agar peluang lolosmu meningkat.", date: "10 Mei 2026" },
  { title: "Beasiswa Ekonomi: Syarat & Cara Daftar", excerpt: "Pahami persyaratan dokumen pendukung dan alur seleksi beasiswa jalur ekonomi.", date: "5 Mei 2026" },
  { title: "Kisah Alumni Kejar Prestasi", excerpt: "Cerita inspiratif para penerima beasiswa angkatan sebelumnya.", date: "1 Mei 2026" },
];

function ArtikelPage() {
  return (
    <main className="container-page py-16">
      <header className="max-w-2xl">
        <span className="inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">Artikel</span>
        <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-foreground">Artikel & Kabar Beasiswa</h1>
        <p className="mt-3 text-muted-foreground">Informasi terbaru, tips, dan inspirasi seputar beasiswa Kejar Prestasi.</p>
      </header>

      <section className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((a) => (
          <article key={a.title} className="rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-soft transition">
            <div className="text-xs text-muted-foreground">{a.date}</div>
            <h2 className="mt-2 text-lg font-semibold text-foreground">{a.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{a.excerpt}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
