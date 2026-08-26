import { useState } from "react";
import { Link,useNavigate,useSearch } from "@tanstack/react-router";
import { ArrowRight,CheckCircle2,Loader2,ShieldCheck,UserRound,Mail,Phone,MapPin,GraduationCap,CalendarDays,School,VenetianMask,Layers3 } from "lucide-react";
import { toast } from "sonner";
import { submitRegistrationFn,sendAppEmail } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { AdSlot } from "@/components/ads/AdSlot";

type Kind="prestasi"|"ekonomi";
type Jalur="reguler"|"akselerasi"|"platinum";
type FormState={full_name:string;birth_place:string;birth_date:string;gender:string;whatsapp:string;email:string;education_level:string;school_name:string;grade:string};
const initial:FormState={full_name:"",birth_place:"",birth_date:"",gender:"",whatsapp:"",email:"",education_level:"",school_name:"",grade:""};
const gradeOptions:Record<string,string[]>={
  "SD/MI":["Kelas 1","Kelas 2","Kelas 3","Kelas 4","Kelas 5","Kelas 6"],
  "SMP/MTs":["Kelas 7","Kelas 8","Kelas 9"],
  "SMA/SMK/MA":["Kelas 10","Kelas 11","Kelas 12"],
  "D3":["Semester 1","Semester 2","Semester 3","Semester 4","Semester 5","Semester 6"],
  "D4/S1":["Semester 1","Semester 2","Semester 3","Semester 4","Semester 5","Semester 6","Semester 7","Semester 8"],
  "S2":["Semester 1","Semester 2","Semester 3","Semester 4"],
};

export function RegistrationForm({kind}:{kind:Kind}){
  const navigate=useNavigate();
  const search=useSearch({strict:false}) as{jalur?:string};
  const jalur:Jalur=search.jalur==="akselerasi"||search.jalur==="platinum"?search.jalur:"reguler";
  const[form,setForm]=useState<FormState>(initial),[submitting,setSubmitting]=useState(false);
  const isPrestasi=kind==="prestasi";
  const kategoriLabel=isPrestasi?"Prestasi":"Ekonomi";
  const jalurLabel=jalur==="platinum"?"Akselerasi Platinum":jalur==="akselerasi"?"Akselerasi":"Reguler";
  const set=(k:keyof FormState,v:string)=>setForm(s=>({...s,[k]:v}));
  const setEducationLevel=(education_level:string)=>setForm(s=>({...s,education_level,grade:""}));

  const submit=async(e:React.FormEvent)=>{
    e.preventDefault();
    if(Object.values(form).some(v=>!v.trim()))return toast.error("Lengkapi seluruh data identitas terlebih dahulu");
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))return toast.error("Email tidak valid");
    if(!/^[+\d\s-]{8,25}$/.test(form.whatsapp))return toast.error("Nomor WhatsApp tidak valid");
    setSubmitting(true);
    try{
      const payload={...form,address:"-",kind,status:jalur==="reguler"?"pending":"approved",extra:{jalur_pendaftaran:jalur}};
      const{token}=await submitRegistrationFn({data:payload as never});
      supabase.functions.invoke("send-whatsapp",{body:{type:"pendaftaran",full_name:form.full_name,email:form.email,whatsapp:form.whatsapp,kind,token}}).catch(()=>{});
      sendAppEmail({data:{templateName:"registration-confirmation",recipientEmail:form.email,idempotencyKey:`reg-${token}`,templateData:{fullName:form.full_name,token,kind,whatsapp:form.whatsapp}}}).catch(()=>{});
      if(jalur!=="reguler"){
        const{data:pay,error:payErr}=await supabase.functions.invoke("create-registration-payment",{body:{token}});
        if(payErr||!pay?.ok)throw new Error("Tahap berikutnya belum dapat dibuka. Silakan coba kembali.");
        if(pay.status==="paid"){
          navigate({to:"/pendaftaran/sukses",search:{name:form.full_name,email:form.email,whatsapp:form.whatsapp,kind,token}});
          return;
        }
        if(pay.link){
          toast.success("Data berhasil disimpan. Melanjutkan ke tahap berikutnya.");
          window.location.href=pay.link;
          return;
        }
        throw new Error("Tahap berikutnya belum tersedia.");
      }
      toast.success("Pendaftaran berhasil dikirim");
      navigate({to:"/pendaftaran/sukses",search:{name:form.full_name,email:form.email,whatsapp:form.whatsapp,kind,token}});
    }catch(err){
      console.error(err);
      toast.error(err instanceof Error?err.message:"Pendaftaran gagal dikirim. Silakan coba kembali.");
    }finally{setSubmitting(false)}
  };

  return <>
    <section className="relative overflow-hidden border-b border-border bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--secondary)/.32))]">
      <div className="pointer-events-none absolute -left-20 -top-28 h-72 w-72 rounded-full bg-primary/10 blur-3xl"/>
      <div className="pointer-events-none absolute -right-24 top-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl"/>
      <div className="container-page relative py-9 md:py-12">
        <Link to={isPrestasi?"/beasiswa-prestasi":"/beasiswa-ekonomi"} className="inline-flex text-xs font-semibold text-primary">← Kembali ke halaman beasiswa</Link>
        <div className="mt-6 overflow-hidden rounded-[2rem] border border-border bg-card shadow-card">
          <div className="grid lg:grid-cols-[1fr_360px]">
            <div className="p-6 md:p-8 lg:p-9">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary-soft px-3 py-1.5 text-[10px] font-black uppercase tracking-[.12em] text-primary"><UserRound size={13}/> Formulir Pendaftaran</span>
              <h1 className="mt-4 max-w-2xl text-3xl font-extrabold leading-tight md:text-4xl">Lengkapi identitas pendaftar</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">Isi data identitas dengan benar. Informasi tambahan dan dokumen program akan dilengkapi pada tahapan selanjutnya.</p>
            </div>
            <div className="border-t border-border bg-secondary/25 p-5 lg:border-l lg:border-t-0 lg:p-6">
              <p className="text-[10px] font-black uppercase tracking-[.14em] text-muted-foreground">Pilihan pendaftaran</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <SummaryCard icon={<Layers3 size={17}/>} label="Kategori" value={kategoriLabel}/>
                <SummaryCard icon={<CheckCircle2 size={17}/>} label="Jalur dipilih" value={jalurLabel}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <AdSlot placement="form_top"/>

    <section className="container-page py-9 md:py-12">
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start">
        <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-card">
          <div className="border-b border-border bg-secondary/20 px-5 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary"><UserRound size={20}/></div>
              <div><p className="text-[10px] font-black uppercase tracking-[.14em] text-primary">Data identitas</p><h2 className="mt-0.5 text-xl font-extrabold">Informasi Pendaftar</h2></div>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
              <Field icon={<UserRound size={16}/>} label="Nama Lengkap" placeholder="Contoh: Rizky Pratama" value={form.full_name} onChange={v=>set("full_name",v)}/>
              <Field icon={<MapPin size={16}/>} label="Tempat Lahir" placeholder="Contoh: Purwokerto" value={form.birth_place} onChange={v=>set("birth_place",v)}/>
              <Field icon={<CalendarDays size={16}/>} label="Tanggal Lahir" type="date" value={form.birth_date} onChange={v=>set("birth_date",v)}/>
              <Select icon={<VenetianMask size={16}/>} label="Jenis Kelamin" placeholder="Pilih jenis kelamin" value={form.gender} onChange={v=>set("gender",v)} options={["Laki-laki","Perempuan"]}/>
              <Field icon={<Phone size={16}/>} label="Nomor WhatsApp Aktif" type="tel" placeholder="Contoh: 081234567890" value={form.whatsapp} onChange={v=>set("whatsapp",v)}/>
              <Field icon={<Mail size={16}/>} label="Email Aktif" type="email" placeholder="Contoh: nama@email.com" value={form.email} onChange={v=>set("email",v)}/>
              <Select icon={<GraduationCap size={16}/>} label="Jenjang Pendidikan" placeholder="Pilih jenjang pendidikan" value={form.education_level} onChange={setEducationLevel} options={["SD/MI","SMP/MTs","SMA/SMK/MA","D3","D4/S1","S2"]}/>
              <Field icon={<School size={16}/>} label="Sekolah / Kampus" placeholder="Contoh: SMA Negeri 1 / Universitas Indonesia" value={form.school_name} onChange={v=>set("school_name",v)}/>
              <Select icon={<GraduationCap size={16}/>} label="Kelas / Semester" placeholder={form.education_level?"Pilih kelas / semester":"Pilih jenjang pendidikan dahulu"} value={form.grade} onChange={v=>set("grade",v)} options={gradeOptions[form.education_level]??[]} disabled={!form.education_level}/>
            </div>
          </div>
        </div>

        <aside className="h-fit overflow-hidden rounded-[2rem] border border-border bg-card shadow-card lg:sticky lg:top-24">
          <div className="border-b border-border bg-primary px-5 py-5 text-primary-foreground">
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10"><ShieldCheck size={18}/></span><div><p className="text-[10px] font-bold uppercase tracking-[.12em] text-white/70">Ringkasan</p><h3 className="text-lg font-extrabold">Sebelum mengirim</h3></div></div>
          </div>
          <div className="p-5">
            <div className="grid gap-3">{["Pastikan seluruh data sudah benar","Gunakan email & WhatsApp yang aktif","Simpan kode pendaftar dari sistem","Lanjutkan tahapan program berikutnya"].map((t,i)=><div key={t} className="flex items-start gap-3 rounded-xl border border-border/70 bg-secondary/20 px-3.5 py-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-black text-primary-foreground">{i+1}</span><p className="text-sm leading-5 text-foreground/80">{t}</p></div>)}</div>
            <button disabled={submitting} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-black text-primary-foreground shadow-soft transition hover:-translate-y-0.5 disabled:opacity-50">{submitting?<Loader2 size={16} className="animate-spin"/>:<ArrowRight size={16}/>} Kirim Pendaftaran</button>
            <p className="mt-3 text-center text-[11px] leading-4 text-muted-foreground">Dengan mengirim formulir, data akan tersimpan pada sistem pendaftaran Kejar Prestasi.</p>
          </div>
        </aside>
      </form>
    </section>
  </>;
}

function SummaryCard({icon,label,value}:{icon:React.ReactNode;label:string;value:string}){return <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3.5"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">{icon}</span><div className="min-w-0"><p className="text-[9px] font-black uppercase tracking-[.12em] text-muted-foreground">{label}</p><p className="mt-0.5 truncate text-sm font-extrabold text-foreground">{value}</p></div></div>}

function Field({label,value,onChange,type="text",placeholder="",icon}:{label:string;value:string;onChange:(v:string)=>void;type?:string;placeholder?:string;icon?:React.ReactNode}){return <label><span className="flex items-center gap-2 text-xs font-semibold text-foreground">{icon&&<span className="text-primary">{icon}</span>}{label}</span><input required type={type} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)} className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-sm outline-none transition placeholder:text-muted-foreground/55 focus:border-primary focus:ring-4 focus:ring-primary/10"/></label>}

function Select({label,value,onChange,options,placeholder="Pilih",icon,disabled=false}:{label:string;value:string;onChange:(v:string)=>void;options:string[];placeholder?:string;icon?:React.ReactNode;disabled?:boolean}){return <label><span className="flex items-center gap-2 text-xs font-semibold text-foreground">{icon&&<span className="text-primary">{icon}</span>}{label}</span><select required disabled={disabled} value={value} onChange={e=>onChange(e.target.value)} className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-secondary/50 disabled:text-muted-foreground"><option value="">{placeholder}</option>{options.map(o=><option key={o}>{o}</option>)}</select></label>}
