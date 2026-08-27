import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle2, HelpCircle, MessageCircleQuestion, Search, ShieldCheck, Sparkles } from "lucide-react";

const faqs = [
  { q: "Apa saja kategori beasiswa yang tersedia?", a: "Terdapat tiga kategori beasiswa, yaitu Beasiswa Prestasi, Beasiswa Ekonomi, dan Beasiswa Umum. Pilih satu kategori yang paling sesuai dengan profil dan kebutuhanmu." },
  { q: "Apakah pendaftaran beasiswa ini berbayar?", a: "Tidak. Jalur Reguler tersedia tanpa biaya pendaftaran." },
  { q: "Siapa saja yang boleh mendaftar?", a: "Pelajar SD, SMP, SMA/SMK/MA, dan mahasiswa aktif di Indonesia dapat mengikuti program sesuai ketentuan yang berlaku." },
  { q: "Apakah ada minimal nilai rapor atau IPK?", a: "Tidak ada batas minimum nilai rapor maupun IPK pada tahap pendaftaran awal." },
  { q: "Berapa total beasiswa yang akan diterima?", a: "Dukungan Dana Pendidikan dapat mencapai total hingga Rp23.000.000 per semester sesuai hasil seleksi dan ketentuan program." },
  { q: "Bagaimana cara mengetahui hasil seleksi?", a: "Status tahapan dan pengumuman dapat dipantau melalui Portal Pendaftar menggunakan kode pendaftaran masing-masing." },
  { q: "Apakah saya bisa mendaftar lebih dari satu kategori?", a: "Setiap peserta memilih satu dari tiga kategori—Prestasi, Ekonomi, atau Umum—serta satu jalur pendaftaran untuk satu proses seleksi." },
  { q: "Bagaimana jika ada kendala saat mendaftar?", a: "Hubungi tim Kejar Prestasi melalui kanal resmi yang tercantum pada website." },
];

function ProfessionalFaqIllustration() {
  return (
    <div className="relative mx-auto h-full min-h-[420px] w-full max-w-[470px] overflow-hidden rounded-[2.25rem] border border-primary/15 bg-[radial-gradient(circle_at_20%_15%,rgba(167,139,250,.45),transparent_30%),radial-gradient(circle_at_85%_80%,rgba(251,191,36,.3),transparent_32%),linear-gradient(145deg,#312e81,#5b21b6_55%,#7c3aed)] p-6 text-white shadow-[0_28px_75px_rgba(76,29,149,.24)] sm:min-h-[470px] sm:p-7" aria-hidden="true">
      <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full border border-white/15"/><div className="absolute -right-5 -top-5 h-28 w-28 rounded-full border border-white/15"/><div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-amber-300/15 blur-2xl"/>
      <div className="relative flex items-center justify-between"><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.16em] backdrop-blur"><Sparkles size={13}/> Question Hub</span><span className="grid h-10 w-10 place-items-center rounded-full bg-white/10 backdrop-blur"><Search size={17}/></span></div>
      <div className="relative mx-auto mt-7 grid h-28 w-28 place-items-center rounded-[2rem] bg-white text-primary shadow-[0_20px_50px_rgba(15,23,42,.28)] sm:h-36 sm:w-36"><div className="absolute -inset-3 rounded-[2.5rem] border border-white/20"/><MessageCircleQuestion size={56} strokeWidth={1.7}/><span className="absolute -right-3 -top-3 grid h-9 w-9 place-items-center rounded-full bg-amber-400 text-xs font-black text-amber-950 shadow-lg">8</span></div>
      <div className="relative mt-8 translate-x-3 rounded-2xl rounded-br-md border border-white/15 bg-white/95 p-3.5 text-foreground shadow-xl sm:translate-x-7"><div className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><HelpCircle size={18}/></span><div><p className="text-[9px] font-black uppercase tracking-wider text-primary">Pertanyaanmu</p><p className="mt-0.5 text-sm font-extrabold">Program ini di adakan oleh siapa?</p></div></div></div>
      <div className="relative z-10 -mt-1 -translate-x-2 rounded-2xl rounded-tl-md border border-emerald-200/60 bg-emerald-50 p-4 text-emerald-950 shadow-xl sm:-translate-x-5"><div className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white"><CheckCircle2 size={18}/></span><div><p className="text-[9px] font-black uppercase tracking-wider text-emerald-700">Jawaban cepat</p><p className="mt-0.5 text-sm font-bold">Program ini di adakan oleh Kejar Prestasi</p></div></div></div>
      <div className="relative mt-5 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15 text-amber-300"><ShieldCheck size={20}/></span><div><p className="text-xs font-black uppercase tracking-[.12em]">Informasi Terverifikasi</p><p className="mt-0.5 text-[10px] text-white/65">Jawaban resmi dari tim Kejar Prestasi.</p></div></div>
    </div>
  );
}

export function FAQSection() {
  return (
    <section className="border-y border-border bg-secondary/30">
      <div className="container-page py-16 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary-soft px-3.5 py-1.5 text-xs font-bold text-primary shadow-sm"><HelpCircle size={14} /> FAQ</span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">Pertanyaan yang Sering Diajukan</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">Jawaban singkat untuk pertanyaan paling umum seputar program Beasiswa Kejar Prestasi.</p>
        </div>
        <div className="mx-auto mt-10 grid max-w-6xl gap-8 lg:grid-cols-[0.86fr_1.4fr] lg:items-stretch lg:gap-10">
          <ProfessionalFaqIllustration />
          <div className="h-full xl:min-h-[470px]">
            <Accordion type="single" collapsible className="grid h-full w-full items-stretch gap-2.5 xl:grid-cols-2 xl:grid-rows-[repeat(4,minmax(72px,auto))]">
              {faqs.map((f, i) => (<AccordionItem key={i} value={`item-${i}`} className="group flex h-full flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-[0_6px_20px_rgba(15,23,42,.05)] transition duration-300 data-[state=open]:-translate-y-0.5 data-[state=open]:border-primary/25 data-[state=open]:bg-[linear-gradient(135deg,white,rgba(245,243,255,.9))] data-[state=open]:shadow-[0_12px_30px_rgba(91,33,182,.11)]"><AccordionTrigger className="h-full min-h-[72px] gap-2.5 px-3.5 py-3 text-left text-[13px] font-extrabold leading-5 text-foreground hover:no-underline sm:px-4 sm:py-3.5 sm:text-sm"><span className="flex min-w-0 items-center gap-2.5"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border bg-secondary/50 text-[9px] font-black text-muted-foreground transition group-data-[state=open]:border-primary/15 group-data-[state=open]:bg-primary group-data-[state=open]:text-white">{String(i+1).padStart(2,"0")}</span><span>{f.q}</span></span></AccordionTrigger><AccordionContent className="px-3.5 pb-3.5 pt-0 sm:px-4 sm:pb-4"><div className="ml-10 rounded-lg border border-primary/10 bg-primary-soft/45 p-3 text-xs leading-5 text-muted-foreground"><span className="mb-1.5 inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[.14em] text-primary"><CheckCircle2 size={12}/> Jawaban</span><p>{f.a}</p></div></AccordionContent></AccordionItem>))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
