import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, BookOpen, GraduationCap, HeartHandshake, ShieldCheck, Sparkles, Trophy, Users, Wallet } from "lucide-react";

export const Route = createFileRoute("/daftar")({
  head: () => ({
    meta: [
      { title: "Pilih Jalur Pendaftaran — Kejar Prestasi" },
      { name: "description", content: "Pilih kategori Beasiswa Prestasi atau Beasiswa Ekonomi sebelum melanjutkan proses pendaftaran." },
    ],
  }),
  component: DaftarSelector,
});

function DaftarSelector() {
  return (
    <main className="relative overflow-hidden bg-[linear-gradient(180deg,oklch(0.985_0.01_285),white_42%,oklch(0.985_0.008_155))]">
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-28 top-52 h-80 w-80 rounded-full bg-emerald-200/25 blur-3xl" />

      <section className="container-page relative py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid items-end gap-7 lg:grid-cols-[1fr_auto]">
            <header className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[.12em] text-primary shadow-sm backdrop-blur"><GraduationCap size={14}/> Mulai Pendaftaran</span>
              <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">Tentukan kategori beasiswa yang paling sesuai</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Pilih satu kategori untuk melihat detail program dan menentukan jalur Reguler, Akselerasi, atau Platinum.</p>
            </header>

            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border bg-white/75 p-2 shadow-card backdrop-blur sm:min-w-[360px]">
              <InfoPill value="3" label="Kategori" />
              <InfoPill value="3" label="Jalur" />
              <InfoPill value="Rp0" label="Reguler" />
            </div>
          </div>

          <section className="mt-9 grid gap-5 lg:grid-cols-3">
            <ProgramCard
              to="/beasiswa-prestasi"
              tone="primary"
              icon={<Trophy size={24}/>} 
              eyebrow="Jalur Prestasi"
              title="Beasiswa Prestasi"
              desc="Untuk peserta yang ingin menonjolkan pencapaian akademik maupun non-akademik."
              bullets={["Tanpa minimal nilai / IPK", "SD sampai Mahasiswa", "Dana pendidikan hingga Rp23 Juta / semester"]}
              stats={[{icon:<Trophy size={15}/>,label:"Fokus",value:"Prestasi"},{icon:<BadgeCheck size={15}/>,label:"Reguler",value:"Gratis"}]}
              cta="Lihat Jalur Prestasi"
            />

            <ProgramCard
              to="/beasiswa-ekonomi"
              tone="emerald"
              icon={<HeartHandshake size={24}/>} 
              eyebrow="Jalur Ekonomi"
              title="Beasiswa Ekonomi"
              desc="Untuk peserta yang membutuhkan dukungan pendidikan dan ingin tetap melanjutkan proses seleksi."
              bullets={["Tanpa minimal nilai / IPK", "SD sampai Mahasiswa", "Dana pendidikan hingga Rp23 Juta / semester"]}
              stats={[{icon:<Wallet size={15}/>,label:"Fokus",value:"Dukungan"},{icon:<BadgeCheck size={15}/>,label:"Reguler",value:"Gratis"}]}
              cta="Lihat Jalur Ekonomi"
            />
            <ProgramCard
              to="/pendaftaran/umum"
              tone="primary"
              icon={<BookOpen size={24}/>}
              eyebrow="Kategori Umum"
              title="Beasiswa Umum"
              desc="Kategori terbuka bagi mahasiswa yang ingin memperoleh dukungan pendidikan dan pengembangan diri."
              bullets={["Terbuka untuk mahasiswa", "Seleksi studi kasus", "Administrasi berbasis portofolio"]}
              stats={[{icon:<Users size={15}/>,label:"Kategori",value:"Umum"},{icon:<BadgeCheck size={15}/>,label:"Reguler",value:"Gratis"}]}
              cta="Daftar Beasiswa Umum"
            />
          </section>

          <div className="mt-7 grid gap-3 rounded-[1.6rem] border border-border bg-white/75 p-4 shadow-card backdrop-blur sm:grid-cols-3 sm:p-5">
            <BottomPoint icon={<ShieldCheck size={18}/>} title="Pilih satu kategori" text="Kategori dipilih sebelum masuk ke jalur pendaftaran." />
            <BottomPoint icon={<Users size={18}/>} title="Terbuka luas" text="Pelajar dan mahasiswa dapat mengikuti sesuai ketentuan." />
            <BottomPoint icon={<Sparkles size={18}/>} title="Jalur fleksibel" text="Reguler, Akselerasi, dan Platinum tersedia pada tiap kategori." />
          </div>
        </div>
      </section>
    </main>
  );
}

function ProgramCard({to,tone,icon,eyebrow,title,desc,bullets,stats,cta}:{to:"/beasiswa-prestasi"|"/beasiswa-ekonomi"|"/pendaftaran/umum";tone:"primary"|"emerald";icon:React.ReactNode;eyebrow:string;title:string;desc:string;bullets:string[];stats:{icon:React.ReactNode;label:string;value:string}[];cta:string}) {
  const green=tone==="emerald";
  return <article className={`group relative overflow-hidden rounded-[2rem] border bg-card shadow-[0_20px_55px_rgba(15,23,42,.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_70px_rgba(15,23,42,.12)] ${green?"border-emerald-200":"border-primary/15"}`}>
    <div className={`absolute inset-x-0 top-0 h-1.5 ${green?"bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400":"bg-gradient-to-r from-primary via-violet-500 to-indigo-500"}`} />
    <div aria-hidden="true" className={`absolute -right-16 -top-16 h-52 w-52 rounded-full blur-3xl opacity-40 ${green?"bg-emerald-200":"bg-primary/20"}`} />

    <div className="relative p-5 sm:p-6 lg:p-7">
      <div className="flex items-start justify-between gap-5">
        <span className={`grid h-14 w-14 place-items-center rounded-2xl border shadow-[0_9px_18px_rgba(15,23,42,.12),inset_0_1px_1px_rgba(255,255,255,.9)] ${green?"border-emerald-200 bg-gradient-to-br from-white via-emerald-50 to-emerald-100 text-emerald-700":"border-primary/15 bg-gradient-to-br from-white via-primary-soft to-violet-100 text-primary"}`}>{icon}</span>
        <span className={`rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[.14em] ${green?"border-emerald-200 bg-emerald-50 text-emerald-700":"border-primary/15 bg-primary-soft text-primary"}`}>{eyebrow}</span>
      </div>

      <h2 className="mt-6 text-2xl font-black tracking-tight text-foreground sm:text-3xl">{title}</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{desc}</p>

      <div className="mt-5 grid grid-cols-2 gap-3">{stats.map((stat)=><div key={stat.label} className="rounded-2xl border border-border/70 bg-secondary/25 px-3.5 py-3"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.icon}{stat.label}</div><p className="mt-1 text-sm font-extrabold text-foreground">{stat.value}</p></div>)}</div>

      <div className="mt-5 rounded-2xl border border-border/70 bg-background/80 p-4">
        <p className="text-[10px] font-black uppercase tracking-[.14em] text-muted-foreground">Ringkasan</p>
        <div className="mt-3 grid gap-2.5">{bullets.map((item)=><div key={item} className="flex items-start gap-2.5 text-sm leading-5 text-foreground/85"><span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-white ${green?"bg-emerald-500":"bg-primary"}`}><BadgeCheck size={11}/></span><span>{item}</span></div>)}</div>
      </div>

      <Link to={to} className={`mt-6 flex min-h-12 w-full items-center justify-between rounded-2xl px-5 py-3.5 text-sm font-black text-white shadow-lg transition group-hover:translate-y-[-1px] ${green?"bg-gradient-to-r from-emerald-600 to-teal-500 shadow-emerald-500/15":"bg-gradient-to-r from-primary to-violet-600 shadow-primary/15"}`}><span>{cta}</span><span className="grid h-8 w-8 place-items-center rounded-full bg-white/15"><ArrowRight size={16}/></span></Link>
    </div>
  </article>;
}

function InfoPill({value,label}:{value:string;label:string}){return <div className="rounded-xl bg-secondary/45 px-3 py-2.5 text-center"><div className="text-base font-black text-foreground">{value}</div><div className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div></div>}
function BottomPoint({icon,title,text}:{icon:React.ReactNode;title:string;text:string}){return <div className="flex items-start gap-3 rounded-2xl px-2 py-2"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-background text-primary shadow-sm">{icon}</span><div><p className="text-sm font-extrabold text-foreground">{title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p></div></div>}
