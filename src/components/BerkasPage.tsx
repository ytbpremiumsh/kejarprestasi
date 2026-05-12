import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, LinkIcon, Loader2, Search, UserCheck, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { BerkasSchema, DocSlot } from "@/lib/form-schema";
import { AdSlot } from "@/components/ads/AdSlot";

const defaultDocs: Record<"prestasi" | "ekonomi", DocSlot[]> = {
  prestasi: [
    { id: "identity", key: "identity", label: "Kartu Identitas", required: true },
    { id: "transcript", key: "transcript", label: "Transkrip Nilai atau Kartu Hasil Studi (Mahasiswa)", required: true },
    { id: "achievement", key: "achievement", label: "Verifikasi Penghargaan yang Diterima", required: true },
    { id: "essay", key: "essay", label: "Esai dengan Tema yang Sudah Ditentukan", required: true },
    { id: "supporting", key: "supporting", label: "Sertifikat Pendukung Lainnya", required: false },
  ],
  ekonomi: [
    { id: "identity", key: "identity", label: "Kartu Identitas", required: true },
    { id: "sktm", key: "sktm", label: "Surat Keterangan Tidak Mampu (SKTM)", required: true },
    { id: "income", key: "income", label: "Keterangan Penghasilan Orang Tua", required: true },
    { id: "electricity", key: "electricity", label: "Bukti Pembayaran Listrik Rumah Terakhir", required: true },
    { id: "essay", key: "essay", label: "Esai dengan Tema yang Sudah Ditentukan", required: true },
    { id: "supporting", key: "supporting", label: "Sertifikat Pendukung Lainnya", required: false },
  ],
};

function isValidUrl(v: string) {
  try {
    const u = new URL(v.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

type RegInfo = {
  id?: string;
  full_name: string;
  whatsapp: string;
  nik?: string | null;
  school_name?: string | null;
  education_level?: string | null;
};

export function BerkasPage({ kind }: { kind: "prestasi" | "ekonomi" }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [docs, setDocs] = useState<DocSlot[]>(defaultDocs[kind]);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [registrant, setRegistrant] = useState<RegInfo | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setDocs(defaultDocs[kind]);
    setValues({});

    (async () => {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", `form_berkas_${kind}`)
          .maybeSingle();
        if (!mounted) return;
        if (data?.value && Array.isArray((data.value as BerkasSchema).fields)) {
          const configured = (data.value as BerkasSchema).fields;
          if (configured.length > 0) setDocs(configured);
        }
      } catch {
        /* ignore */
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [kind]);

  const setVal = (key: string, v: string) => setValues((s) => ({ ...s, [key]: v }));

  const handleSearch = async () => {
    const e = email.trim();
    if (!e || !e.includes("@")) {
      toast.error("Masukkan email pendaftaran yang valid");
      return;
    }
    setSearching(true);
    setSearchError(null);
    setRegistrant(null);
    try {
      const { data, error } = await supabase.functions.invoke("lookup-pendaftar", {
        body: { email: e, kind },
      });
      if (error) throw error;
      const payload = data as { ok: boolean; data?: RegInfo; error?: string };
      if (!payload?.ok || !payload.data) {
        const msg = payload?.error === "not_found"
          ? `Data pendaftar dengan email tersebut tidak ditemukan untuk Beasiswa ${kind === "prestasi" ? "Prestasi" : "Ekonomi"}.`
          : "Gagal mencari data pendaftar.";
        setSearchError(msg);
        return;
      }
      setRegistrant(payload.data);
      toast.success(`Data ditemukan: ${payload.data.full_name}`);
    } catch (err) {
      console.error(err);
      setSearchError("Terjadi kesalahan saat mencari data.");
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrant) {
      toast.error("Cari data pendaftar terlebih dahulu");
      return;
    }
    const missing = docs.filter((d) => d.required && !(values[d.key] ?? "").trim());
    if (missing.length > 0) {
      toast.error(`Lengkapi: ${missing.map((d) => d.label).join(", ")}`);
      return;
    }
    const invalid = docs.filter((d) => {
      const v = (values[d.key] ?? "").trim();
      if (!v) return false;
      return !isValidUrl(v);
    });
    if (invalid.length > 0) {
      toast.error(`URL tidak valid: ${invalid.map((d) => d.label).join(", ")}`);
      return;
    }

    setSubmitting(true);
    try {
      const rows = docs
        .map((d) => ({ d, v: (values[d.key] ?? "").trim() }))
        .filter(({ v }) => v.length > 0)
        .map(({ d, v }) => ({ email: email.trim(), kind, doc_type: d.label, file_url: v }));

      const { error } = await supabase.from("documents").insert(rows);
      if (error) throw error;

      supabase.functions.invoke("send-whatsapp", {
        body: {
          type: "berkas",
          email: email.trim(),
          full_name: registrant.full_name,
          whatsapp: "",
          kind,
          doc_count: rows.length,
        },
      }).catch(() => { /* ignore */ });

      toast.success("Berkas berhasil dikirim!");
      navigate({ to: "/berkas/terkirim", search: { kind, count: rows.length } });
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
          Masukkan tautan (URL) berkas-berkas pendukung sesuai persyaratan. Pastikan dokumen dapat diakses (Google Drive, Dropbox, dsb. — atur izin "Siapa saja dengan link").
        </p>
      </div>

      <AdSlot placement="berkas_top" />

      <form onSubmit={handleSubmit} className="mt-10 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 md:p-7 shadow-card">
            <h2 className="text-base font-bold text-foreground">Identitas</h2>
            <div className="mt-5 grid sm:grid-cols-2 gap-5">
              <label className="block sm:col-span-2">
                <span className="text-xs font-medium text-foreground/80">
                  Email pendaftaran<span className="text-destructive"> *</span>
                </span>
                <div className="mt-1.5">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email yang kamu pakai saat mendaftar"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    required
                  />
                </div>
              </label>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 md:p-7 shadow-card">
            <h2 className="text-base font-bold text-foreground">Tautan Berkas</h2>
            <div className="mt-5 space-y-6">
              {docs.map((d) => {
                const v = values[d.key] ?? "";
                const showError = v.trim().length > 0 && !isValidUrl(v);
                return (
                  <label key={d.id} className="block">
                    <span className="flex items-center gap-2 flex-wrap text-xs font-medium text-foreground/80">
                      <span>
                        {d.label}
                        {d.required && <span className="text-destructive"> *</span>}
                      </span>
                      {!d.required && (
                        <span className="text-[10px] font-semibold uppercase rounded-full bg-secondary text-muted-foreground px-2 py-0.5">Opsional</span>
                      )}
                    </span>
                    <div className="mt-1.5 relative">
                      <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="url"
                        value={v}
                        onChange={(e) => setVal(d.key, e.target.value)}
                        placeholder="https://drive.google.com/..."
                        className={`w-full rounded-xl border bg-background pl-9 pr-3.5 py-2.5 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary/30 ${showError ? "border-destructive" : "border-border focus:border-primary"}`}
                        required={d.required}
                      />
                    </div>
                    {showError && <div className="mt-1 text-[11px] text-destructive">URL tidak valid (gunakan http/https)</div>}
                  </label>
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
                "Gunakan tautan publik (Google Drive/Dropbox/OneDrive)",
                "Atur izin akses ke 'Siapa saja dengan link'",
                "Pastikan tautan benar dan dapat dibuka",
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
      <AdSlot placement="berkas_bottom" />
    </section>
  );
}
