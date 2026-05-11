import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, UploadCloud, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const docsByKind = {
  prestasi: [
    { key: "ktp", label: "KTP / Kartu Pelajar", required: true },
    { key: "kk", label: "Kartu Keluarga (KK)", required: true },
    { key: "rapor", label: "Rapor / Transkrip", required: true },
    { key: "sertifikat", label: "Sertifikat Prestasi", required: true },
    { key: "essay", label: "Essay Motivasi (PDF/DOC)", required: true },
    { key: "video", label: "Video Motivasi (link/file)", required: false },
  ],
  ekonomi: [
    { key: "ktp", label: "KTP / Kartu Pelajar", required: true },
    { key: "kk", label: "Kartu Keluarga (KK)", required: true },
    { key: "penghasilan", label: "Surat Keterangan Penghasilan Orang Tua", required: true },
    { key: "tidakmampu", label: "Surat Tidak Mampu (opsional)", required: false },
    { key: "rapor", label: "Rapor / Transkrip", required: true },
    { key: "video", label: "Video Motivasi (link/file)", required: false },
  ],
} as const;

async function uploadFile(file: File, kind: string, key: string) {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${kind}/docs/${key}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("kp-uploads").upload(path, file, { upsert: false });
  if (error) throw error;
  return supabase.storage.from("kp-uploads").getPublicUrl(path).data.publicUrl;
}

export function BerkasPage({ kind }: { kind: "prestasi" | "ekonomi" }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [submitting, setSubmitting] = useState(false);
  const docs = docsByKind[kind];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Masukkan email pendaftaran terlebih dahulu");
      return;
    }
    const missing = docs.filter((d) => d.required && !files[d.key]);
    if (missing.length > 0) {
      toast.error(`Lengkapi: ${missing.map((d) => d.label).join(", ")}`);
      return;
    }

    setSubmitting(true);
    try {
      const rows = [];
      for (const d of docs) {
        const f = files[d.key];
        if (!f) continue;
        const url = await uploadFile(f, kind, d.key);
        rows.push({ email: email.trim(), kind, doc_type: d.label, file_url: url });
      }
      const { error } = await supabase.from("documents").insert(rows);
      if (error) throw error;
      toast.success("Berkas berhasil dikirim!");
      navigate({ to: "/" });
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengirim berkas. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container-page py-12 md:py-16">
      <Link to="/" className="text-xs font-semibold text-primary hover:underline">← Kembali ke Beranda</Link>
      <div className="mt-4 max-w-3xl">
        <span className="inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
          Berkas {kind === "prestasi" ? "Beasiswa Prestasi" : "Beasiswa Ekonomi"}
        </span>
        <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-foreground">Pengiriman Berkas Pendukung</h1>
        <p className="mt-2 text-muted-foreground">
          Unggah berkas-berkas pendukung sesuai persyaratan. Pastikan dokumen jelas terbaca.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 md:p-7 shadow-card">
            <h2 className="text-base font-bold text-foreground">Identitas</h2>
            <label className="mt-4 block">
              <span className="text-xs font-medium text-foreground/80">Email pendaftaran</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email yang kamu pakai saat mendaftar"
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                required
              />
            </label>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 md:p-7 shadow-card">
            <h2 className="text-base font-bold text-foreground">Daftar Berkas</h2>
            <div className="mt-5 space-y-3">
              {docs.map((d) => (
                <div key={d.key} className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <FileText size={18} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">{d.label}</span>
                      {d.required ? (
                        <span className="text-[10px] font-bold uppercase rounded-full bg-destructive/10 text-destructive px-2 py-0.5">Wajib</span>
                      ) : (
                        <span className="text-[10px] font-semibold uppercase rounded-full bg-secondary text-muted-foreground px-2 py-0.5">Opsional</span>
                      )}
                    </div>
                    {files[d.key] && <div className="mt-1 text-[11px] text-muted-foreground truncate">{files[d.key]!.name}</div>}
                  </div>
                  <label className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:border-primary hover:text-primary cursor-pointer transition">
                    <UploadCloud size={14} /> {files[d.key] ? "Ganti" : "Pilih"}
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setFiles((s) => ({ ...s, [d.key]: e.target.files?.[0] ?? null }))}
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 h-fit">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground">Catatan</h3>
            <ul className="mt-4 space-y-3 text-sm text-foreground/85">
              {[
                "Format file: PDF, JPG, PNG, MP4",
                "Ukuran maksimum: 20MB per file",
                "Nama file gunakan huruf/angka",
                "Berkas akan diverifikasi oleh tim",
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
            {submitting ? <><Loader2 size={16} className="animate-spin" /> Mengirim…</> : <>Kirim Berkas <ArrowRight size={16} /></>}
          </button>
        </aside>
      </form>
    </section>
  );
}
