import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { CheckCircle2, MessageCircle, Home, FileText } from "lucide-react";
import { z } from "zod";

const searchSchema = z.object({
  kind: z.enum(["prestasi", "ekonomi"]).optional(),
  count: z.number().optional(),
});

export const Route = createFileRoute("/berkas/terkirim")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Berkas Terkirim — Kejar Prestasi" },
      { name: "description", content: "Berkas Anda berhasil dikirim dan sedang diverifikasi." },
    ],
  }),
  component: BerkasTerkirim,
});

function BerkasTerkirim() {
  const { kind, count } = useSearch({ from: "/berkas/terkirim" });
  const jenis = kind === "prestasi" ? "Beasiswa Prestasi" : kind === "ekonomi" ? "Beasiswa Ekonomi" : "Beasiswa";

  return (
    <section className="container-page py-16 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft text-primary shadow-soft">
          <CheckCircle2 size={44} />
        </div>
        <h1 className="mt-6 text-3xl md:text-4xl font-extrabold text-foreground">
          Berkas Berhasil Dikirim!
        </h1>
        <p className="mt-3 text-muted-foreground">
          Terima kasih, berkas {jenis} Anda{count ? ` (${count} file)` : ""} telah kami terima dan
          sedang dalam tahap verifikasi oleh tim kami.
        </p>

        <div className="mt-8 rounded-3xl border border-border bg-card p-6 md:p-7 shadow-card text-left">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <MessageCircle size={18} className="text-primary" /> Notifikasi WhatsApp
          </h2>
          <p className="mt-2 text-sm text-foreground/85">
            Kami telah mengirim notifikasi konfirmasi ke nomor WhatsApp yang Anda daftarkan.
            Mohon periksa pesan masuk Anda. Jika belum menerima dalam beberapa menit, mohon
            tunggu — pengiriman bisa tertunda.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-foreground/85">
            <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 text-primary shrink-0" /> Berkas akan diverifikasi dalam 1–3 hari kerja</li>
            <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 text-primary shrink-0" /> Hasil verifikasi akan dikirim via WhatsApp</li>
            <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 text-primary shrink-0" /> Pastikan nomor WhatsApp Anda aktif</li>
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-95 transition"
          >
            <Home size={16} /> Kembali ke Beranda
          </Link>
          <Link
            to="/artikel"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:border-primary hover:text-primary transition"
          >
            <FileText size={16} /> Baca Artikel
          </Link>
        </div>
      </div>
    </section>
  );
}
