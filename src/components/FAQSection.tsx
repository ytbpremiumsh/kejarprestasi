import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  { q: "Apa saja kategori beasiswa yang tersedia?", a: "Terdapat tiga kategori beasiswa, yaitu Beasiswa Prestasi, Beasiswa Ekonomi, dan Beasiswa Umum. Pilih satu kategori yang paling sesuai dengan profil dan kebutuhanmu." },
  { q: "Apakah pendaftaran beasiswa ini berbayar?", a: "Tidak. Jalur Reguler tersedia tanpa biaya pendaftaran. Jalur Akselerasi dan Platinum memiliki biaya layanan sesuai pilihan peserta." },
  { q: "Siapa saja yang boleh mendaftar?", a: "Pelajar SD, SMP, SMA/SMK/MA, dan mahasiswa aktif di Indonesia dapat mengikuti program sesuai ketentuan yang berlaku." },
  { q: "Apakah ada minimal nilai rapor atau IPK?", a: "Tidak ada batas minimum nilai rapor maupun IPK pada tahap pendaftaran awal." },
  { q: "Berapa total beasiswa yang akan diterima?", a: "Dukungan Dana Pendidikan dapat mencapai total hingga Rp23.000.000 per semester sesuai hasil seleksi dan ketentuan program." },
  { q: "Bagaimana cara mengetahui hasil seleksi?", a: "Status tahapan dan pengumuman dapat dipantau melalui Portal Pendaftar menggunakan kode pendaftaran masing-masing." },
  { q: "Apakah saya bisa mendaftar lebih dari satu kategori?", a: "Setiap peserta memilih satu dari tiga kategori—Prestasi, Ekonomi, atau Umum—serta satu jalur pendaftaran untuk satu proses seleksi." },
  { q: "Bagaimana jika ada kendala saat mendaftar?", a: "Hubungi tim Kejar Prestasi melalui kanal resmi yang tercantum pada website." },
];

function ProfessionalFaqIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-[520px]" aria-hidden="true">
      <svg viewBox="0 0 620 520" className="h-auto w-full overflow-visible" role="img">
        <defs>
          <linearGradient id="faqBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#EEF2FF" /><stop offset="55%" stopColor="#F8FAFC" /><stop offset="100%" stopColor="#FFF7ED" /></linearGradient>
          <linearGradient id="faqCard" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FFFFFF" /><stop offset="100%" stopColor="#F8FAFC" /></linearGradient>
          <linearGradient id="faqPurple" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#6D28D9" /><stop offset="100%" stopColor="#4F46E5" /></linearGradient>
          <linearGradient id="faqGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FBBF24" /><stop offset="100%" stopColor="#F59E0B" /></linearGradient>
          <filter id="faqShadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#0F172A" floodOpacity="0.12" /></filter>
          <filter id="softShadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#312E81" floodOpacity="0.14" /></filter>
        </defs>
        <rect x="38" y="30" width="544" height="438" rx="54" fill="url(#faqBg)" />
        <circle cx="108" cy="112" r="54" fill="#DDD6FE" opacity="0.65" /><circle cx="510" cy="98" r="32" fill="#FDE68A" opacity="0.55" /><circle cx="500" cy="398" r="58" fill="#DBEAFE" opacity="0.55" />
        <g filter="url(#faqShadow)"><rect x="118" y="118" width="384" height="254" rx="30" fill="url(#faqCard)" stroke="#E2E8F0" strokeWidth="2" /><rect x="150" y="150" width="320" height="48" rx="16" fill="#F8FAFC" /><circle cx="177" cy="174" r="11" fill="url(#faqPurple)" /><path d="M174 171c0-4 6-5 8-1 2 4-4 5-4 8" fill="none" stroke="white" strokeWidth="2.6" strokeLinecap="round" /><circle cx="178" cy="183" r="1.5" fill="white" /><rect x="204" y="165" width="154" height="8" rx="4" fill="#1E293B" opacity="0.88" /><rect x="204" y="179" width="108" height="6" rx="3" fill="#94A3B8" opacity="0.75" /><circle cx="438" cy="174" r="13" fill="#EEF2FF" /><path d="m433 171 5 5 5-5" fill="none" stroke="#4F46E5" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />{[0,1,2].map((i)=><g key={i} transform={`translate(0 ${i*54})`}><line x1="151" y1="218" x2="468" y2="218" stroke="#E2E8F0" /><rect x="160" y="234" width={210-i*24} height="7" rx="3.5" fill="#475569" opacity="0.8" /><rect x="160" y="247" width={128+i*18} height="5" rx="2.5" fill="#CBD5E1" /><circle cx="441" cy="241" r="12" fill="#F8FAFC" /><path d="m436 238 5 5 5-5" fill="none" stroke="#64748B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></g>)}</g>
        <g filter="url(#softShadow)"><path d="M72 184c0-36 29-65 65-65s65 29 65 65c0 29-19 54-46 62l-10 28-22-24c-30-6-52-33-52-66Z" fill="url(#faqPurple)" /><text x="137" y="207" textAnchor="middle" fontSize="72" fontWeight="800" fill="white" fontFamily="Arial, sans-serif">?</text></g>
        <g filter="url(#softShadow)"><rect x="430" y="68" width="108" height="62" rx="22" fill="white" stroke="#E2E8F0" /><circle cx="458" cy="99" r="15" fill="url(#faqGold)" /><path d="M458 88v5m0 12v5m-11-11h5m12 0h5" stroke="white" strokeWidth="2.4" strokeLinecap="round" /><rect x="482" y="89" width="36" height="7" rx="3.5" fill="#1E293B" /><rect x="482" y="103" width="26" height="5" rx="2.5" fill="#CBD5E1" /></g>
        <g filter="url(#softShadow)"><path d="M94 355h136c17 0 30 13 30 30v18c0 17-13 30-30 30h-73l-25 22 4-22H94c-17 0-30-13-30-30v-18c0-17 13-30 30-30Z" fill="#0F172A" /><circle cx="112" cy="394" r="6" fill="#A78BFA" /><circle cx="137" cy="394" r="6" fill="#FBBF24" /><circle cx="162" cy="394" r="6" fill="#60A5FA" /><rect x="183" y="386" width="49" height="7" rx="3.5" fill="#E2E8F0" opacity="0.9" /><rect x="183" y="401" width="32" height="5" rx="2.5" fill="#94A3B8" /></g>
        <g transform="translate(393 356)" filter="url(#softShadow)"><rect x="0" y="0" width="124" height="78" rx="20" fill="white" stroke="#E2E8F0" /><rect x="18" y="18" width="52" height="42" rx="8" fill="#EEF2FF" /><path d="M27 32h34M27 41h25M27 50h19" stroke="#6366F1" strokeWidth="4" strokeLinecap="round" /><circle cx="92" cy="39" r="17" fill="#F1F5F9" /><path d="M85 39l5 5 9-11" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></g>
        <path d="M88 85c24-35 59-51 103-49" fill="none" stroke="#C4B5FD" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 12" /><path d="M527 164c25 24 35 52 28 84" fill="none" stroke="#FCD34D" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 12" />
      </svg>
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
        <div className="mx-auto mt-10 grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.35fr] lg:items-center lg:gap-12">
          <ProfessionalFaqIllustration />
          <div className="overflow-hidden rounded-[1.75rem] border border-border bg-card p-2 shadow-[0_18px_50px_rgba(15,23,42,.08)] md:p-4">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (<AccordionItem key={i} value={`item-${i}`} className="border-border/80 last:border-b-0"><AccordionTrigger className="px-3 py-5 text-left text-sm font-bold text-foreground hover:no-underline md:px-4 md:text-base">{f.q}</AccordionTrigger><AccordionContent className="px-3 pb-5 text-sm leading-6 text-muted-foreground md:px-4">{f.a}</AccordionContent></AccordionItem>))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
