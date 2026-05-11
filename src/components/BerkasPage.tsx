import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, FileText, Image as ImageIcon, Loader2, UploadCloud, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { BerkasSchema, DocSlot } from "@/lib/form-schema";

type SlotState = {
  file: File | null;
  preview: string | null;
  progress: number;
  error: string | null;
};

async function uploadFile(file: File, kind: string, key: string): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${kind}/docs/${key}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("kp-uploads").upload(path, file, { upsert: false });
  if (error) throw error;
  return supabase.storage.from("kp-uploads").getPublicUrl(path).data.publicUrl;
}

function fileMatches(file: File, accept?: string) {
  if (!accept) return true;
  const tokens = accept.split(",").map((s) => s.trim().toLowerCase());
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return tokens.some((t) => {
    if (!t) return false;
    if (t.startsWith(".")) return name.endsWith(t);
    if (t.endsWith("/*")) return type.startsWith(t.slice(0, -1));
    return type === t;
  });
}

export function BerkasPage({ kind }: { kind: "prestasi" | "ekonomi" }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [docs, setDocs] = useState<DocSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<Record<string, SlotState>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", `form_berkas_${kind}`)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value && Array.isArray((data.value as BerkasSchema).fields)) {
          setDocs((data.value as BerkasSchema).fields);
        }
        setLoading(false);
      });
  }, [kind]);

  const setSlot = (key: string, patch: Partial<SlotState>) =>
    setState((s) => ({ ...s, [key]: { file: null, preview: null, progress: 0, error: null, ...s[key], ...patch } }));

  const onPick = (slot: DocSlot, file: File | null) => {
    if (!file) {
      setSlot(slot.key, { file: null, preview: null, error: null, progress: 0 });
      return;
    }
    if (!fileMatches(file, slot.accept)) {
      setSlot(slot.key, { file: null, preview: null, error: `Format tidak didukung (${slot.accept})`, progress: 0 });
      return;
    }
    if (slot.maxSize && file.size > slot.maxSize * 1024 * 1024) {
      setSlot(slot.key, { file: null, preview: null, error: `Ukuran maksimum ${slot.maxSize}MB`, progress: 0 });
      return;
    }
    const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
    setSlot(slot.key, { file, preview, error: null, progress: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Masukkan email pendaftaran terlebih dahulu");
      return;
    }
    const missing = docs.filter((d) => d.required && !state[d.key]?.file);
    if (missing.length > 0) {
      toast.error(`Lengkapi: ${missing.map((d) => d.label).join(", ")}`);
      return;
    }

    setSubmitting(true);
    try {
      const rows: { email: string; kind: string; doc_type: string; file_url: string }[] = [];
      for (const d of docs) {
        const slot = state[d.key];
        if (!slot?.file) continue;
        // simulate progress (Supabase JS client doesn't expose upload progress)
        setSlot(d.key, { progress: 30 });
        const url = await uploadFile(slot.file, kind, d.key);
        setSlot(d.key, { progress: 100 });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

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
              {docs.map((d) => {
                const s = state[d.key];
                return (
                  <div key={d.id} className="rounded-2xl border border-border bg-background p-4">
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary shrink-0">
                        {s?.preview ? <ImageIcon size={18} /> : <FileText size={18} />}
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
                        <div className="mt-1 text-[11px] text-muted-foreground">
                          {d.accept ?? "Semua format"} · maks {d.maxSize ?? 20}MB
                        </div>
                        {s?.file && (
                          <div className="mt-2 text-[11px] text-foreground/80 truncate">
                            {s.file.name} · {(s.file.size / 1024 / 1024).toFixed(2)}MB
                          </div>
                        )}
                        {s?.error && <div className="mt-1 text-[11px] text-destructive">{s.error}</div>}
                        {s && s.progress > 0 && s.progress < 100 && (
                          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div className="h-full bg-primary transition-all" style={{ width: `${s.progress}%` }} />
                          </div>
                        )}
                        {s?.preview && (
                          <img src={s.preview} alt="" className="mt-3 max-h-32 rounded-lg border border-border object-cover" />
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <label className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:border-primary hover:text-primary cursor-pointer transition">
                          <UploadCloud size={14} /> {s?.file ? "Ganti" : "Pilih"}
                          <input
                            type="file"
                            className="hidden"
                            accept={d.accept}
                            onChange={(e) => onPick(d, e.target.files?.[0] ?? null)}
                          />
                        </label>
                        {s?.file && (
                          <button
                            type="button"
                            onClick={() => onPick(d, null)}
                            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive"
                          >
                            <X size={12} /> Hapus
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {docs.length === 0 && (
                <p className="text-sm text-muted-foreground">Belum ada daftar berkas. Admin belum mengonfigurasi.</p>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 h-fit">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground">Catatan</h3>
            <ul className="mt-4 space-y-3 text-sm text-foreground/85">
              {[
                "Format & ukuran sesuai pada tiap berkas",
                "Ukuran maksimum default 20MB",
                "Pastikan dokumen jelas terbaca",
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
