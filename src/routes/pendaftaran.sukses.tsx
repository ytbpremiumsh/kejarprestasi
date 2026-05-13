import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { CheckCircle2, ArrowRight, MessageCircle, Heart, FileUp } from "lucide-react";
import { DonationCard } from "@/components/DonationCard";

type Search = {
  name?: string;
  email?: string;
  whatsapp?: string;
  kind?: "prestasi" | "ekonomi";
};

export const Route = createFileRoute("/pendaftaran/sukses")({
  head: () => ({
    meta: [
      { title: "Pendaftaran Berhasil — Beasiswa Prestasi Emas" },
      { name: "description", content: "Pendaftaran beasiswa berhasil dikirim. Lanjutkan dengan mengirim berkas pendukung." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    name: typeof s.name === "string" ? s.name : undefined,
    email: typeof s.email === "string" ? s.email : undefined,
    whatsapp: typeof s.whatsapp === "string" ? s.whatsapp : undefined,
    kind: s.kind === "prestasi" || s.kind === "ekonomi" ? s.kind : undefined,
  }),
  component: SuksesPage,
});

function SuksesPage() {
  const { name, email, whatsapp, kind } = useSearch({ from: "/pendaftaran/sukses" });
  const berkasTo = kind === "ekonomi" ? "/berkas/ekonomi" : "/berkas/prestasi";
  const jenis = kind === "ekonomi" ? "Beasiswa Ekonomi" : kind === "prestasi" ? "Beasiswa Prestasi" : "Beasiswa";

  return (
    <main className="container-page py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        {/* HERO sukses */}
        <div className="text-center">
          <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft text-primary shadow-soft">
            <CheckCircle2 size={44} />
          </div>
          <h1 className="mt-6 text-3xl md:text-4xl font-extrabold text-foreground">
            Pendaftaran Berhasil!
          </h1>
          <p className="mt-3 text-muted-foreground">
            {name ? `Halo ${name}, p` : "P"}endaftaran {jenis} kamu sudah kami terima.
            Sekarang lanjutkan ke langkah berikutnya: <span className="font-semibold text-foreground">kirim berkas pendukung</span>.
          </p>
        </div>

        {/* Langkah berikutnya */}
        <div className="mt-8 rounded-3xl border-2 border-primary/30 bg-card p-6 md:p-7 shadow-card">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <FileUp size={20} />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold uppercase tracking-wide text-primary">Langkah 2 dari 2</div>
              <h2 className="mt-0.5 text-lg font-extrabold text-foreground">Kirim Berkas Pendukung</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pendaftaranmu belum selesai sampai berkas masuk. Siapkan dokumen sesuai persyaratan, lalu klik tombol di bawah.
              </p>
            </div>
          </div>
          <Link
            to={berkasTo as "/berkas/prestasi" | "/berkas/ekonomi"}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-95 transition"
          >
            Kirim Berkas Sekarang <ArrowRight size={16} />
          </Link>
        </div>

        {/* Notifikasi WhatsApp */}
        <div className="mt-6 rounded-3xl border border-border bg-card p-6 md:p-7 shadow-card">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <MessageCircle size={18} className="text-primary" /> Notifikasi WhatsApp
          </h2>
          <p className="mt-2 text-sm text-foreground/85">
            Kami sudah mengirim konfirmasi ke nomor WhatsApp yang kamu daftarkan. Mohon periksa pesan masuk.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-foreground/85">
            <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 text-primary shrink-0" /> Verifikasi pendaftaran 1–3 hari kerja setelah berkas lengkap</li>
            <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 text-primary shrink-0" /> Hasil seleksi dikirim via WhatsApp</li>
            <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 text-primary shrink-0" /> Pastikan nomor WhatsApp aktif</li>
          </ul>
        </div>

        {/* Pemisah + soft-sell donasi */}
        <div className="mt-10 mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            <Heart size={12} className="fill-current" /> Sambil Menunggu
          </div>
          <div className="h-px flex-1 bg-border" />
        </div>
        <p className="text-center text-sm text-muted-foreground mb-4">
          Program ini gratis untuk peserta. Kalau kamu merasa terbantu dan ingin ikut menjaga program ini tetap berjalan untuk pelajar lain, kamu bisa berdonasi sukarela di bawah 👇
        </p>

        <DonationCard
          defaultName={name ?? ""}
          defaultEmail={email ?? ""}
          defaultWhatsapp={whatsapp ?? ""}
        />
      </div>
    </main>
  );
}
