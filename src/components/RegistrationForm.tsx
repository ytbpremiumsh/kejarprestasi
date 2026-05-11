import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, UploadCloud } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const baseSchema = z.object({
  full_name: z.string().trim().min(2, "Nama minimal 2 karakter").max(200),
  nik: z.string().trim().regex(/^\d{5,32}$/, "NIK harus berupa angka"),
  birth_place: z.string().trim().min(2).max(100),
  birth_date: z.string().min(1, "Wajib diisi"),
  gender: z.enum(["Laki-laki", "Perempuan"]),
  address: z.string().trim().min(5).max(500),
  whatsapp: z.string().trim().regex(/^[+\d\s-]{6,25}$/, "Nomor tidak valid"),
  email: z.string().trim().email("Email tidak valid").max(200),
  education_level: z.enum(["SD", "SMP", "SMA/SMK/MA", "Mahasiswa"]),
  school_name: z.string().trim().min(2).max(200),
  grade: z.string().trim().min(1).max(50),
});

const prestasiSchema = baseSchema.extend({
  main_achievement: z.string().trim().min(3, "Wajib diisi").max(500),
});

const ekonomiSchema = baseSchema.extend({
  parent_income: z.string().trim().min(1, "Wajib diisi").max(100),
  dependents: z.coerce.number().int().min(0).max(50),
});

async function uploadFile(file: File, prefix: string): Promise<string | null> {
  if (!file) return null;
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("kp-uploads").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("kp-uploads").getPublicUrl(path);
  return data.publicUrl;
}

export function RegistrationForm({ kind }: { kind: "prestasi" | "ekonomi" }) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photo, setPhoto] = useState<File | null>(null);
  const [card, setCard] = useState<File | null>(null);

  const isPrestasi = kind === "prestasi";
  const title = isPrestasi ? "Pendaftaran Beasiswa Prestasi" : "Pendaftaran Beasiswa Ekonomi";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd.entries());

    const schema = isPrestasi ? prestasiSchema : ekonomiSchema;
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const map: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        map[issue.path[0] as string] = issue.message;
      }
      setErrors(map);
      toast.error("Periksa kembali isian formulir");
      return;
    }

    setSubmitting(true);
    try {
      const photoUrl = photo ? await uploadFile(photo, `${kind}/photo`) : null;
      const cardUrl = card ? await uploadFile(card, `${kind}/card`) : null;

      const { error } = await supabase.from("registrations").insert({
        kind,
        status: "pending",
        ...parsed.data,
        photo_url: photoUrl,
        student_card_url: cardUrl,
      });
      if (error) throw error;

      toast.success("Pendaftaran berhasil dikirim!");
      navigate({ to: kind === "prestasi" ? "/berkas/prestasi" : "/berkas/ekonomi" });
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengirim pendaftaran. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container-page py-12 md:py-16">
      <Link to="/" className="text-xs font-semibold text-primary hover:underline">← Kembali ke Beranda</Link>
      <div className="mt-4 max-w-3xl">
        <span className="inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
          {isPrestasi ? "Beasiswa Prestasi" : "Beasiswa Ekonomi"}
        </span>
        <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-foreground">{title}</h1>
        <p className="mt-2 text-muted-foreground">
          Lengkapi formulir di bawah ini. Pastikan seluruh data benar sebelum dikirim.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Data Pribadi">
            <Grid>
              <Field label="Nama lengkap" name="full_name" error={errors.full_name} />
              <Field label="NIK" name="nik" inputMode="numeric" error={errors.nik} />
              <Field label="Tempat lahir" name="birth_place" error={errors.birth_place} />
              <Field label="Tanggal lahir" name="birth_date" type="date" error={errors.birth_date} />
              <Select label="Jenis kelamin" name="gender" error={errors.gender} options={["Laki-laki", "Perempuan"]} />
              <Field label="No WhatsApp" name="whatsapp" placeholder="08xxxxxxxxxx" error={errors.whatsapp} />
              <Field label="Email" name="email" type="email" className="sm:col-span-2" error={errors.email} />
              <Field label="Alamat lengkap" name="address" textarea className="sm:col-span-2" error={errors.address} />
            </Grid>
          </Card>

          <Card title="Pendidikan">
            <Grid>
              <Select label="Jenjang pendidikan" name="education_level" error={errors.education_level} options={["SD", "SMP", "SMA/SMK/MA", "Mahasiswa"]} />
              <Field label="Nama sekolah/kampus" name="school_name" error={errors.school_name} />
              <Field label="Kelas / Semester" name="grade" error={errors.grade} />
            </Grid>
          </Card>

          {isPrestasi ? (
            <Card title="Prestasi">
              <Field label="Prestasi utama" name="main_achievement" textarea placeholder="Contoh: Juara 1 Olimpiade Matematika Provinsi 2024" error={errors.main_achievement} />
            </Card>
          ) : (
            <Card title="Kondisi Ekonomi">
              <Grid>
                <Field label="Penghasilan orang tua / bulan" name="parent_income" placeholder="Contoh: Rp2.000.000" error={errors.parent_income} />
                <Field label="Jumlah tanggungan" name="dependents" type="number" inputMode="numeric" error={errors.dependents} />
              </Grid>
            </Card>
          )}

          <Card title="Unggah Berkas">
            <Grid>
              <FileField label="Foto diri" onChange={setPhoto} file={photo} accept="image/*" />
              <FileField label="Kartu pelajar / mahasiswa" onChange={setCard} file={card} accept="image/*,application/pdf" />
            </Grid>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 h-fit">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground">Sebelum mengirim</h3>
            <ul className="mt-4 space-y-3 text-sm text-foreground/85">
              {[
                "Pastikan data pribadi sesuai KTP/KK",
                "Email & WhatsApp aktif untuk notifikasi",
                "Foto diri & kartu pelajar terbaca jelas",
                "Tidak dipungut biaya apapun",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 text-primary shrink-0" /> {t}</li>
              ))}
            </ul>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-95 transition disabled:opacity-60"
          >
            {submitting ? <><Loader2 size={16} className="animate-spin" /> Mengirim…</> : <>Kirim Pendaftaran <ArrowRight size={16} /></>}
          </button>
          <p className="text-[11px] text-muted-foreground text-center">
            Setelah mengirim, kamu akan diarahkan ke halaman pengiriman berkas pendukung.
          </p>
        </aside>
      </form>
    </section>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-7 shadow-card">
      <h2 className="text-base font-bold text-foreground">{title}</h2>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-4">{children}</div>;
}

function Field({
  label, name, type = "text", placeholder, textarea, className, error, inputMode,
}: {
  label: string; name: string; type?: string; placeholder?: string; textarea?: boolean;
  className?: string; error?: string; inputMode?: "numeric" | "text";
}) {
  const cls = `w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary/30 ${error ? "border-destructive" : "border-border focus:border-primary"}`;
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="text-xs font-medium text-foreground/80">{label}</span>
      <div className="mt-1.5">
        {textarea ? (
          <textarea name={name} placeholder={placeholder} rows={3} className={cls} />
        ) : (
          <input name={name} type={type} placeholder={placeholder} inputMode={inputMode} className={cls} />
        )}
      </div>
      {error && <span className="mt-1 block text-[11px] text-destructive">{error}</span>}
    </label>
  );
}

function Select({ label, name, options, error }: { label: string; name: string; options: string[]; error?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-foreground/80">{label}</span>
      <select name={name} defaultValue="" className={`mt-1.5 w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 ${error ? "border-destructive" : "border-border focus:border-primary"}`}>
        <option value="" disabled>Pilih…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      {error && <span className="mt-1 block text-[11px] text-destructive">{error}</span>}
    </label>
  );
}

function FileField({ label, onChange, file, accept }: { label: string; onChange: (f: File | null) => void; file: File | null; accept?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-foreground/80">{label}</span>
      <div className="mt-1.5 flex items-center gap-3 rounded-xl border border-dashed border-border bg-background px-3.5 py-3 hover:border-primary transition cursor-pointer">
        <UploadCloud size={18} className="text-primary shrink-0" />
        <input
          type="file"
          accept={accept}
          className="text-xs text-foreground/80 file:mr-3 file:rounded-full file:border-0 file:bg-primary-soft file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </div>
      {file && <span className="mt-1 block text-[11px] text-muted-foreground">{file.name}</span>}
    </label>
  );
}
