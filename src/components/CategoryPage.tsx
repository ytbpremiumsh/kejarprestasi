import { Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Check, Clock3, Crown, HeartHandshake, Share2, ShieldCheck, Sparkles, Trophy, Users, Wallet, X, Zap } from "lucide-react";
import { useState } from "react";
import { AdSlot } from "@/components/ads/AdSlot";

type CategoryKind="prestasi"|"ekonomi";
type RegistrationPath="/pendaftaran/prestasi"|"/pendaftaran/ekonomi";
type SharePath="/bagikan-poster/prestasi"|"/bagikan-poster/ekonomi";
type PathId="reguler"|"akselerasi"|"platinum";

const quickFacts=[
  {icon:Users,label:"Jenjang",value:"SD – Mahasiswa"},
  {icon:Wallet,label:"Dukungan",value:"hingga Rp17 Juta"},
  {icon:BadgeCheck,label:"Reguler",value:"Gratis"},
];

export function CategoryPage({kind,title,tagline,desc,registerTo,shareTo}:{kind:CategoryKind;title:string;tagline:string;desc:string;registerTo:RegistrationPath;shareTo:SharePath}){
  const isGold=kind==="ekonomi";
  const MainIcon=isGold?HeartHandshake:Trophy;
  const[showPaths,setShowPaths]=useState(false);
  const points=isGold?
    ["Terbuka untuk pelajar & mahasiswa","Tidak ada minimal nilai/IPK","Fokus pada kebutuhan pendidikan","Seleksi dilakukan bertahap"]:
    ["Terbuka untuk pelajar & mahasiswa","Tidak ada minimal nilai/IPK","Prestasi akademik/non-akademik diterima","Seleksi dilakukan bertahap"];
  const benefits=isGold?
    [{icon:Wallet,title:"Dukungan Pendidikan"},{icon:HeartHandshake,title:"Akses Lebih Terbuka"},{icon:Users,title:"Komunitas Peserta"},{icon:ShieldCheck,title:"Sertifikat Program"}]:
    [{icon:Trophy,title:"Apresiasi Prestasi"},{icon:Sparkles,title:"Dukungan Semester"},{icon:Users,title:"Komunitas Peserta"},{icon:ShieldCheck,title:"Sertifikat Program"}];

  return <>
    <section className="relative overflow-hidden border-b border-border bg-background">
      <div className={`absolute inset-x-0 top-0 h-56 opacity-60 blur-3xl ${isGold?"bg-gold/10":"bg-primary/10"}`}/>
      <div className="container-page relative py-10 md:py-14 lg:py-16">
        <Link to="/" className="text-xs font-semibold text-muted-foreground hover:text-primary">← Kembali ke Beranda</Link>
        <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
          <div className="max-w-3xl">
            <span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold ${isGold?"border-gold/25 bg-gold/10 text-[oklch(0.55_0.16_75)]":"border-primary/15 bg-primary-soft text-primary"}`}><MainIcon size={16}/>{tagline}</span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">{desc}</p>
            <div className="mt-6 grid max-w-2xl gap-2 sm:grid-cols-2">{points.map(p=><div key={p} className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-3 text-sm"><span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${isGold?"bg-gold/10 text-[oklch(0.55_0.16_75)]":"bg-primary-soft text-primary"}`}><Check size={13}/></span><span>{p}</span></div>)}</div>
            <div className="mt-6 grid max-w-md grid-cols-2 gap-3"><button type="button" onClick={()=>setShowPaths(true)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft transition hover:-translate-y-0.5">Daftar Sekarang <ArrowRight size={16}/></button><Link to={shareTo} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold hover:border-primary/30 hover:text-primary"><Share2 size={16}/> Bagikan Program</Link></div>
          </div>

          <aside className={`rounded-[1.8rem] border p-5 shadow-soft ${isGold?"border-gold/20 bg-gold/8":"border-primary/15 bg-primary-soft/60"}`}>
            <div className="flex items-center gap-4"><span className={`grid h-12 w-12 place-items-center rounded-2xl ${isGold?"bg-gold text-white":"bg-primary text-primary-foreground"}`}><MainIcon size={22}/></span><div><p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ringkasan Program</p><p className="mt-1 text-xl font-extrabold">{isGold?"Jalur Ekonomi":"Jalur Prestasi"}</p></div></div>
            <div className="mt-5 grid gap-2">{quickFacts.map(({icon:FactIcon,label,value})=><div key={label} className="flex items-center justify-between rounded-xl border border-border/70 bg-background/80 px-3.5 py-3"><div className="flex items-center gap-2 text-xs text-muted-foreground"><FactIcon size={15}/>{label}</div><b className="text-sm">{value}</b></div>)}</div>
          </aside>
        </div>
      </div>
    </section>

    <AdSlot placement="category_top"/>

    <section className="container-page py-10 md:py-14">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between"><div><span className="text-[10px] font-bold uppercase tracking-widest text-primary">Yang perlu diketahui</span><h2 className="mt-1 text-2xl font-extrabold md:text-3xl">Singkat, jelas, langsung ke inti</h2></div><p className="max-w-xl text-sm text-muted-foreground">Informasi utama program diringkas agar kamu tidak perlu membaca terlalu banyak teks sebelum mendaftar.</p></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{benefits.map(({icon:BenefitIcon,title:benefitTitle})=><div key={benefitTitle} className="rounded-2xl border border-border bg-card p-4 shadow-card"><span className={`grid h-10 w-10 place-items-center rounded-xl ${isGold?"bg-gold/10 text-[oklch(0.55_0.16_75)]":"bg-primary-soft text-primary"}`}><BenefitIcon size={18}/></span><h3 className="mt-4 text-sm font-extrabold">{benefitTitle}</h3></div>)}</div>
    </section>

    <AdSlot placement="category_middle"/>

    <section className="container-page py-6 md:py-10"><div className="rounded-[1.8rem] border border-border bg-card p-5 shadow-card md:p-7"><div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center"><div><span className="text-[10px] font-bold uppercase tracking-widest text-primary">Pendaftaran</span><h2 className="mt-1 text-2xl font-extrabold">Pilih jalur yang paling sesuai</h2><p className="mt-1.5 text-sm text-muted-foreground">Reguler, Akselerasi, atau Platinum dapat dibandingkan dalam satu tampilan.</p></div><div className="grid w-full grid-cols-2 gap-3 md:w-[360px]"><button type="button" onClick={()=>setShowPaths(true)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">Pilih Jalur <ArrowRight size={16}/></button><Link to={shareTo} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-bold">Bagikan <Share2 size={15}/></Link></div></div></div></section>

    <AdSlot placement="category_bottom"/>
    {showPaths&&<RegistrationPathModal registerTo={registerTo} kind={kind} onClose={()=>setShowPaths(false)}/>} 
  </>;
}

function RegistrationPathModal({registerTo,kind,onClose}:{registerTo:RegistrationPath;kind:CategoryKind;onClose:()=>void}){
  const[selected,setSelected]=useState<PathId>("akselerasi");
  const programName=kind==="prestasi"?"Prestasi":"Ekonomi";
  const paths=[
    {id:"reguler" as PathId,name:"Reguler",price:"Gratis",icon:Clock3,theme:"regular" as const,desc:"Tanpa biaya",features:["Bagikan Twibbon","Bagikan Poster","Follow Instagram resmi"]},
    {id:"akselerasi" as PathId,name:"Akselerasi",price:"Rp15.000",icon:Zap,theme:"accent" as const,badge:"REKOMENDASI",desc:"Proses lebih cepat",highlight:"Lolos administrasi otomatis",features:["Peluang dana pendidikan","Proses dipercepat","E-Sertifikat","E-Book & E-Sheet"]},
    {id:"platinum" as PathId,name:"Platinum",price:"Rp45.000",icon:Crown,theme:"premium" as const,badge:"PREMIUM",desc:"Benefit eksklusif",highlight:"Lolos administrasi otomatis",features:["Peluang dana + Tablet Awardee","Prioritas proses","E-Sertifikat","E-Book & E-Sheet"]},
  ];
  const renderCard=(path:typeof paths[number])=>{const I=path.icon;const premium=path.theme==="premium";const accent=path.theme==="accent";const target=`${registerTo}?jalur=${path.id}` as RegistrationPath;return <article key={path.id} className={`relative flex h-full flex-col rounded-[1.5rem] border bg-card p-5 shadow-card ${premium?"border-emerald-200":accent?"border-amber-300":"border-border"}`}>
    {path.badge&&<span className={`absolute right-0 top-0 rounded-bl-xl px-3 py-2 text-[9px] font-black tracking-wider text-white ${premium?"bg-emerald-600":"bg-orange-500"}`}>{path.badge}</span>}
    <div className="flex items-center gap-3 pr-20"><span className={`grid h-11 w-11 place-items-center rounded-xl ${premium?"bg-emerald-50 text-emerald-600":accent?"bg-amber-50 text-amber-600":"bg-primary-soft text-primary"}`}><I size={20}/></span><div><h3 className="text-lg font-extrabold">{path.name}</h3><p className="text-xs text-muted-foreground">{path.desc}</p></div></div>
    <div className={`mt-4 rounded-xl border px-4 py-3 ${premium?"border-emerald-200 bg-emerald-50/70":accent?"border-amber-200 bg-amber-50/70":"border-border bg-secondary/30"}`}><p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Biaya</p><p className={`mt-0.5 text-2xl font-black ${premium?"text-emerald-700":accent?"text-orange-600":"text-primary"}`}>{path.price}</p></div>
    {premium&&<div className="mt-4 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-600 p-4 text-white"><p className="text-[9px] font-black uppercase tracking-wider text-emerald-100">Benefit Platinum</p><p className="mt-1 text-sm font-extrabold">Tablet Pendidikan untuk Awardee</p></div>}
    {path.highlight&&<div className={`mt-4 flex items-center gap-2 rounded-xl border px-3.5 py-3 text-sm font-extrabold ${premium?"border-emerald-200 bg-emerald-50 text-emerald-700":"border-amber-200 bg-amber-50 text-amber-700"}`}><Check size={15}/>{path.highlight}</div>}
    <div className="mt-4 grid gap-2.5">{path.features.map(f=><div key={f} className="flex items-start gap-2.5 text-sm"><span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-white ${premium?"bg-emerald-500":accent?"bg-amber-500":"bg-primary"}`}><Check size={11}/></span><span>{f}</span></div>)}</div>
    <Link to={target} onClick={onClose} className={`mt-auto flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black ${premium?"bg-emerald-600 text-white":accent?"bg-orange-500 text-white":"border-2 border-primary text-primary"}`}>{path.id==="reguler"?"Pilih Reguler":path.id==="akselerasi"?"Pilih Akselerasi":"Pilih Platinum"}<ArrowRight size={15}/></Link>
  </article>};

  return <div className="fixed inset-0 z-[100] overflow-y-auto bg-foreground/55 p-2 backdrop-blur-sm sm:p-4" role="dialog" aria-modal="true"><div className="relative mx-auto my-3 w-full max-w-[1240px] rounded-[1.7rem] border border-border bg-background p-4 shadow-2xl sm:p-5 lg:p-7"><button onClick={onClose} className="absolute right-3 top-3 rounded-full border border-border bg-card p-2"><X size={18}/></button><div className="pr-10 text-center"><span className="text-[10px] font-black uppercase tracking-widest text-primary">Pilih Jalur</span><h2 className="mt-1 text-2xl font-extrabold">Beasiswa {programName}</h2></div><div className="sticky top-2 z-20 mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-background/95 p-1.5 shadow-sm backdrop-blur lg:hidden">{paths.map(p=><button key={p.id} onClick={()=>setSelected(p.id)} className={`rounded-xl border px-2 py-2.5 text-xs font-extrabold ${selected===p.id?p.theme==="premium"?"border-emerald-500 bg-emerald-50 text-emerald-700":p.theme==="accent"?"border-amber-500 bg-amber-50 text-amber-700":"border-primary bg-primary-soft text-primary":"border-border bg-card text-muted-foreground"}`}>{p.name}<span className="block text-[10px] font-semibold">{p.price}</span></button>)}</div><div className="mt-5 lg:grid lg:grid-cols-3 lg:items-stretch lg:gap-5"><div className="lg:hidden">{renderCard(paths.find(p=>p.id===selected)??paths[1])}</div><div className="hidden lg:contents">{paths.map(renderCard)}</div></div></div></div>;
}
