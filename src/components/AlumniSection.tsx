import a1 from "@/assets/peraih-1.webp";
import a2 from "@/assets/peraih-2.webp";
import a3 from "@/assets/peraih-3.webp";
import a4 from "@/assets/peraih-4.webp";
import { Quote, Trophy, ArrowUpRight } from "lucide-react";

const alumni = [
  {
    img: a1,
    name: "Fahrana Zarifa Walijismi",
    school: "Peraih Beasiswa",
    year: "SECTION #2 · 2023",
    quote: "Beasiswa ini membantu saya fokus belajar tanpa khawatir biaya pendidikan.",
  },
  {
    img: a2,
    name: "Salsabila Aulia Rahmadani",
    school: "Peraih Beasiswa",
    year: "SECTION #2 · 2023",
    quote: "Selain dana, mentoringnya membuka banyak peluang baru bagi saya.",
  },
  {
    img: a3,
    name: "Rahma Fitri Nurhidayah",
    school: "Peraih Beasiswa",
    year: "SECTION #2 · 2023",
    quote: "Kejar Prestasi memberi dukungan nyata yang membuat saya semakin termotivasi.",
  },
  {
    img: a4,
    name: "Wasil Mubarok",
    school: "Peraih Beasiswa",
    year: "SECTION #2 · 2023",
    quote: "Proses seleksinya transparan dan benar-benar tanpa pungutan biaya.",
  },
];

export function AlumniSection() {
  return (
    <section className="relative overflow-hidden border-y border-border/60 bg-secondary/35">
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />

      <div className="container-page relative py-20 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-[oklch(0.95_0.10_85)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[oklch(0.52_0.14_70)]">
            <Trophy size={14} /> Peraih Beasiswa
          </span>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight text-foreground md:text-4xl">
            Mereka Sudah Lebih Dulu Meraih
          </h2>
          <p className="mt-3 text-muted-foreground">
            Pengalaman singkat dari penerima yang pernah tumbuh bersama program Kejar Prestasi.
          </p>
        </div>

        {/* Testimonial cards use a distinct editorial layout: portrait + quote, not the standard product/category card. */}
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {alumni.map((a, index) => (
            <article
              key={a.name}
              className="group relative overflow-hidden rounded-[2rem] border border-border/80 bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-soft"
            >
              <div className="flex min-h-[210px]">
                <div className="relative w-[38%] min-w-[132px] overflow-hidden bg-secondary sm:w-[32%]">
                  <img
                    src={a.img}
                    alt={`Penerima beasiswa: ${a.name}`}
                    width={768}
                    height={768}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-foreground/35 to-transparent" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-background/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-primary shadow-card backdrop-blur">
                    {index + 1} / 4
                  </span>
                </div>

                <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-primary">{a.year}</span>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary transition-transform duration-300 group-hover:rotate-12">
                        <ArrowUpRight size={15} />
                      </span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Quote size={20} className="mt-0.5 shrink-0 text-gold" />
                      <p className="text-sm font-medium leading-relaxed text-foreground sm:text-[15px]">{a.quote}</p>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-border pt-4">
                    <h3 className="text-sm font-bold text-foreground">{a.name}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{a.school}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">Setiap perjalanan dimulai dari satu kesempatan.</p>
        </div>
      </div>
    </section>
  );
}
