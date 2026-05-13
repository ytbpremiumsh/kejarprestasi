import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { CheckCircle2, ArrowRight } from "lucide-react";
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
      { title: "Pendaftaran Berhasil — Kejar Prestasi" },
      { name: "description", content: "Pendaftaran beasiswa Kejar Prestasi berhasil dikirim." },
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

  return (
    <main className="container-page py-12 md:py-16">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-card text-center">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
            <CheckCircle2 size={28} />
          </div>
          <h1 className="mt-4 text-2xl md:text-3xl font-extrabold text-foreground">
            Pendaftaran Berhasil!
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {name ? `Halo ${name}, ` : ""}pendaftaranmu telah kami terima.
            Langkah berikutnya: kirim berkas pendukung.
          </p>
          <Link
            to={berkasTo as "/berkas/prestasi" | "/berkas/ekonomi"}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-95 transition"
          >
            Kirim Berkas Sekarang <ArrowRight size={16} />
          </Link>
        </div>

        <DonationCard
          defaultName={name ?? ""}
          defaultEmail={email ?? ""}
          defaultWhatsapp={whatsapp ?? ""}
        />
      </div>
    </main>
  );
}
