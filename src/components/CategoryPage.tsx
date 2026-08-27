import { Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Check, Clock3, Crown, Flame, HeartHandshake, Share2, ShieldCheck, Sparkles, Trophy, Users, Wallet, X, Zap } from "lucide-react";
import { useState } from "react";
import { AdSlot } from "@/components/ads/AdSlot";

type CategoryKind="prestasi"|"ekonomi";
type RegistrationPath="/pendaftaran/prestasi"|"/pendaftaran/ekonomi";
type SharePath="/bagikan-poster/prestasi"|"/bagikan-poster/ekonomi";
type PathId="reguler"|"akselerasi"|"platinum";
const digitalBenefits=["E-Sertifikat peserta program","E-Book Strategi Menyusun Target Prestasi","E-Sheet Planner Prestasi Mingguan"];

export function CategoryPage({kind,title,tagline,desc,registerTo,shareTo}:{kind:CategoryKind;title:string;tagline:string;desc:string;registerTo:RegistrationPath;shareTo:SharePath}){
  const isGold=kind==="ekonomi";
  const MainIcon=isGold?HeartHandshake:Trophy;
  const[showPaths,setShowPaths]=useState(false);
  const facts=[
    {label:"Dana Pendidikan",value:"Hingga Rp23 Juta",sub:"per semester",icon:Wallet},
    {label:"Jenjang",value:"SD – Mahasiswa",sub:"cakupan nasional",icon:Users},
    {label:"Reguler",value:"Gratis",sub:"tanpa biaya",icon:BadgeCheck},
  ];
  const highlights=isGold?
    [{icon:Wallet,title:"Dukungan Finansial",text:"Untuk membantu kebutuhan pendidikan."},{icon:HeartHandshake,title:"Akses Terbuka",text:"Tanpa minimal nilai atau IPK."},{icon:ShieldCheck,title:"Proses Terarah",text:"Tahapan seleksi jelas dan terukur."},{icon:Users,title:"Komunitas",text:"Terhubung dengan peserta lainnya."}]:
    [{icon:Trophy,title:"Prestasi Diapresiasi",text:"Akademik maupun non-akademik."},{icon:Sparkles,title:"Dukungan Semester",text:"Dana pendidikan hingga Rp23 juta."},{icon:ShieldCheck,title:"Proses Terarah",text:"Tahapan seleksi jelas dan terukur."},{icon:Users,title:"Komunitas",text:"Terhubung dengan peserta lainnya."}];

  return <>
    <section className={`relative overflow-hidden border-b border-border/70 ${isGold?"bg-[radial-gradient(circle_at_85%_15%,rgba(245,158,11,.12),transparent_30%),linear-gradient(180deg,#fffdfa,#fff)]":"bg-[radial-gradient(circle_at_85%_15%,rgba(109,40,217,.12),transparent_30%),linear-gradient(180deg,#fcfbff,#fff)]"}`}>
      <div className="container-page py-8 md:py-12 lg:py-14">
        <div className="mb-6 flex items-center justify-between gap-4"><Link to="/" className="text-xs font-bold text-muted-foreground transition hover:text-primary">← Beranda</Link><span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[.16em] ${isGold?"border-amber-200 bg-amber-50 text-amber-700":"border-primary/15 bg-primary-soft text-primary"}`}>{tagline}</span></div>
        <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr] lg:items-stretch">
          <div className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-white p-6 shadow-[0_22px_65px_rgba(15,23,42,.08)] sm:p-8 lg:p-10">
            <div className={`absolute right-0 top-0 h-40 w-40 rounded-bl-[7rem] ${isGold?"bg-amber-100/70":"bg-primary/8"}`}/>
            <div className={`relative grid h-14 w-14 place-items-center rounded-2xl border shadow-[0_10px_20px_rgba(15,23,42,.12),inset_0_2px_2px_rgba(255,255,255,.9)] ${isGold?"border-amber-200 bg-gradient-to-br from-amber-50 to-amber-200 text-amber-700":"border-primary/15 bg-gradient-to-br from-white to-primary-soft text-primary"}`}><MainIcon size={25}/></div>
            <h1 className="relative mt-7 max-w-3xl text-3xl font-black leading-[1.05] tracking-[-.035em] text-foreground sm:text-4xl lg:text-5xl">{title}</h1>
            <p className="relative mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{desc}</p>
            <div className="relative mt-6 flex flex-wrap gap-2">{["Tanpa minimal nilai/IPK","Pelajar & mahasiswa","Seleksi bertahap"].map(x=><span key={x} className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-2 text-xs font-semibold text-foreground/80"><Check size={13} className={isGold?"text-amber-600":"text-primary"}/>{x}</span>)}</div>
            <div className="relative mt-7 max-w-md"><button type="button" onClick={()=>setShowPaths(true)} className={`inline-flex min-h-14 w-full items-center justify-center gap-2.5 rounded-2xl px-7 py-4 text-base font-black text-white shadow-soft transition hover:-translate-y-0.5 ${isGold?"bg-amber-600 hover:bg-amber-700":"bg-primary hover:bg-primary/90"}`}>Pilih Jalur Pendaftaran <ArrowRight size={18}/></button></div>
          </div>

          <aside className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {facts.map(({label,value,sub,icon:FactIcon},i)=><div key={label} className={`group relative overflow-hidden rounded-[1.55rem] border p-5 shadow-card transition hover:-translate-y-1 hover:shadow-soft ${i===0?isGold?"border-amber-200 bg-amber-50":"border-primary/15 bg-primary-soft/60":"border-border bg-card"}`}><div className="flex items-center justify-between gap-4"><div><p className="text-[9px] font-black uppercase tracking-[.16em] text-muted-foreground">{label}</p><p className="mt-1.5 text-xl font-black leading-tight text-foreground">{value}</p><p className="mt-1 text-xs text-muted-foreground">{sub}</p></div><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl border bg-white shadow-sm ${isGold?"border-amber-100 text-amber-600":"border-primary/10 text-primary"}`}><FactIcon size={19}/></span></div></div>)}
          </aside>
        </div>
      </div>
    </section>

    <AdSlot placement="category_top"/>

    <section className="container-page py-10 md:py-14">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{highlights.map(({icon:BenefitIcon,title:benefitTitle,text})=><article key={benefitTitle} className={`group relative overflow-hidden rounded-[1.5rem] border bg-card p-6 shadow-[0_12px_35px_rgba(15,23,42,.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,.1)] ${isGold?"border-amber-100 hover:border-amber-200":"border-primary/10 hover:border-primary/25"}`}><span className={`absolute inset-x-0 top-0 h-1 ${isGold?"bg-gradient-to-r from-amber-500 to-orange-400":"bg-gradient-to-r from-primary to-violet-400"}`}/><span className={`grid h-12 w-12 place-items-center rounded-2xl border transition-transform duration-300 group-hover:scale-105 ${isGold?"border-amber-100 bg-amber-50 text-amber-600":"border-primary/10 bg-primary-soft text-primary"}`}><BenefitIcon size={21}/></span><h3 className="mt-6 text-base font-extrabold tracking-tight text-foreground">{benefitTitle}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></article>)}</div>
    </section>

    <AdSlot placement="category_middle"/>

    <section className="container-page py-6 md:py-10"><div className="overflow-hidden rounded-[1.8rem] border border-border bg-foreground text-background shadow-[0_20px_60px_rgba(15,23,42,.15)]"><div className="grid gap-0 md:grid-cols-[1fr_auto]"><div className="p-6 md:p-8"><span className="text-[10px] font-black uppercase tracking-[.16em] text-background/45">Siap melanjutkan?</span><h2 className="mt-2 text-2xl font-black md:text-3xl">Pilih jalur pendaftaranmu.</h2><p className="mt-2 text-sm text-background/60">Reguler, Akselerasi, atau Platinum tersedia dalam satu tampilan perbandingan.</p></div><div className="grid min-w-[320px] grid-cols-2 gap-3 border-t border-background/10 bg-background/5 p-5 md:border-l md:border-t-0 md:p-6"><button type="button" onClick={()=>setShowPaths(true)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-background px-4 py-3 text-sm font-black text-foreground">Pilih Jalur <ArrowRight size={15}/></button><Link to={shareTo} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-background/20 px-4 py-3 text-sm font-bold text-background">Bagikan <Share2 size={15}/></Link></div></div></div></section>

    <AdSlot placement="category_bottom"/>
    {showPaths&&<RegistrationPathModal registerTo={registerTo} kind={kind} onClose={()=>setShowPaths(false)}/>} 
  </>;
}

function RegistrationPathModal({registerTo,kind,onClose}:{registerTo:RegistrationPath;kind:CategoryKind;onClose:()=>void}){
  const[selected,setSelected]=useState<PathId>("akselerasi");
  const programName=kind==="prestasi"?"Prestasi":"Ekonomi";
  const paths=[
    {id:"reguler" as PathId,name:"Reguler",price:"Gratis",icon:Clock3,theme:"regular" as const,desc:"Tanpa biaya",features:["Peluang dana pendidikan hingga Rp23 juta / semester","Bagikan Twibbon","Bagikan Poster","Follow Instagram resmi"]},
    {id:"akselerasi" as PathId,name:"Akselerasi",price:"Rp15.000",icon:Zap,theme:"accent" as const,badge:"REKOMENDASI",desc:"Proses lebih cepat",highlights:["Lolos Studi Kasus"],features:["Peluang dana pendidikan hingga Rp23 juta / semester","Proses dipercepat",...digitalBenefits]},
    {id:"platinum" as PathId,name:"Platinum",price:"Rp45.000",icon:Crown,theme:"premium" as const,badge:"PALING POPULER",desc:"Benefit eksklusif",highlights:["Lolos Studi Kasus","Lolos Administrasi Program","Ikut Tes Potensi Akademik"],features:["Peluang dana hingga Rp23 juta / semester + Tablet Awardee","Prioritas proses",...digitalBenefits]},
  ];
  const renderCard=(path:typeof paths[number])=>{const I=path.icon;const premium=path.theme==="premium";const accent=path.theme==="accent";const target=`${registerTo}?jalur=${path.id}` as RegistrationPath;return <article key={path.id} className={`relative flex h-full flex-col rounded-[1.5rem] border bg-card p-5 shadow-card sm:p-6 ${premium?"border-emerald-200":accent?"border-amber-300":"border-border"}`}>
    {path.badge&&<span className={`absolute right-0 top-0 z-10 inline-flex items-center gap-1 rounded-bl-xl px-3 py-2 text-[9px] font-black tracking-wider text-white ${premium?"bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400 shadow-[0_6px_20px_rgba(249,115,22,.35)]":"bg-orange-500"}`}>{premium&&<Flame size={12} fill="currentColor"/>}{path.badge}</span>}
    <div className="flex items-center gap-3 pr-20"><span className={`grid h-11 w-11 place-items-center rounded-xl ${premium?"bg-emerald-50 text-emerald-600":accent?"bg-amber-50 text-amber-600":"bg-primary-soft text-primary"}`}><I size={20}/></span><div><h3 className="text-lg font-extrabold">{path.name}</h3><p className="text-xs text-muted-foreground">{path.desc}</p></div></div>
    <div className={`mt-4 rounded-xl border px-4 py-3 ${premium?"border-emerald-200 bg-emerald-50/70":accent?"border-amber-200 bg-amber-50/70":"border-border bg-secondary/30"}`}><p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Biaya</p><p className={`mt-0.5 text-2xl font-black ${premium?"text-emerald-700":accent?"text-orange-600":"text-primary"}`}>{path.price}</p></div>
    {premium&&<div className="platinum-benefit mt-4 grid min-h-[112px] grid-cols-[minmax(0,1fr)_122px] items-end overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-600 p-4 text-white shadow-[0_12px_28px_rgba(5,150,105,.2)]"><div className="relative z-10 self-center"><p className="text-[9px] font-black uppercase tracking-[.12em] text-emerald-100">Benefit Platinum</p><p className="mt-1.5 text-sm font-extrabold leading-5">Tablet Pendidikan untuk Awardee</p><p className="mt-1 text-[10px] leading-4 text-emerald-100/80">Perangkat belajar eksklusif bagi penerima terpilih.</p></div><div className="tablet-stage" aria-hidden="true"><div className="tablet-back"><span className="tablet-camera"/></div><div className="tablet-front"><span className="tablet-screen"/></div><span className="tablet-podium"/></div></div>}
    {path.highlights&&<div className={`relative mt-4 overflow-hidden rounded-2xl border p-3.5 ${premium?"border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50":"border-amber-200 bg-amber-50"}`}>{premium&&<Sparkles size={38} className="absolute -right-1 -top-1 text-emerald-200/60"/>}<p className={`relative text-[9px] font-black uppercase tracking-[.13em] ${premium?"text-emerald-700":"text-amber-700"}`}>{premium?"Benefit Akselerasi Platinum":"Benefit Akselerasi"}</p><div className="relative mt-2.5 grid gap-2">{path.highlights.map(item=><div key={item} className={`flex items-center gap-2 text-sm font-extrabold ${premium?"text-emerald-800":"text-amber-800"}`}><span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-white ${premium?"bg-emerald-500":"bg-amber-500"}`}><Check size={11}/></span>{item}</div>)}</div></div>}
    <div className="mt-5 grid flex-1 content-start gap-3">{path.features.map(f=><div key={f} className="flex items-start gap-2.5 text-sm leading-5"><span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-white ${premium?"bg-emerald-500":accent?"bg-amber-500":"bg-primary"}`}><Check size={11}/></span><span>{f}</span></div>)}</div>
    <Link to={target} onClick={onClose} className={`mt-7 flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition hover:-translate-y-0.5 ${premium?"bg-emerald-600 text-white hover:bg-emerald-700":accent?"bg-orange-500 text-white hover:bg-orange-600":"border-2 border-primary text-primary hover:bg-primary-soft"}`}>{path.id==="reguler"?"Pilih Reguler":path.id==="akselerasi"?"Pilih Akselerasi":"Pilih Platinum"}<ArrowRight size={15}/></Link>
  </article>};
  return <div className="fixed inset-0 z-[100] overflow-y-auto bg-foreground/55 p-2 backdrop-blur-sm sm:p-4" role="dialog" aria-modal="true"><div className="relative mx-auto my-3 w-full max-w-[1240px] rounded-[1.7rem] border border-border bg-background p-4 shadow-2xl sm:p-5 lg:p-7"><button onClick={onClose} className="absolute right-3 top-3 rounded-full border border-border bg-card p-2"><X size={18}/></button><div className="pr-10 text-center"><span className="text-[10px] font-black uppercase tracking-widest text-primary">Pilih Jalur</span><h2 className="mt-1 text-2xl font-extrabold">Beasiswa {programName}</h2></div><div className="sticky top-2 z-20 mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-background/95 p-1.5 shadow-sm backdrop-blur lg:hidden">{paths.map(p=><button key={p.id} onClick={()=>setSelected(p.id)} className={`rounded-xl border px-2 py-2.5 text-xs font-extrabold ${selected===p.id?p.theme==="premium"?"border-emerald-500 bg-emerald-50 text-emerald-700":p.theme==="accent"?"border-amber-500 bg-amber-50 text-amber-700":"border-primary bg-primary-soft text-primary":"border-border bg-card text-muted-foreground"}`}>{p.name}<span className="block text-[10px] font-semibold">{p.price}</span></button>)}</div><div className="mt-5 lg:grid lg:grid-cols-3 lg:items-stretch lg:gap-5"><div className="lg:hidden">{renderCard(paths.find(p=>p.id===selected)??paths[1])}</div><div className="hidden lg:contents">{paths.map(renderCard)}</div></div></div></div>;
}
