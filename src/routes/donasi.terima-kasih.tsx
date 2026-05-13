import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/donasi/terima-kasih")({
  head: () => ({
    meta: [
      { title: "Terima Kasih — Donasi Kejar Prestasi" },
      { name: "description", content: "Terima kasih atas dukunganmu untuk program Beasiswa Kejar Prestasi." },
    ],
  }),
  component: ThanksPage,
});

function ThanksPage() {
  const [message, setMessage] = useState(
    "Terima kasih atas dukunganmu! Donasimu akan membantu program ini terus berjalan.",
  );

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "donation")
      .maybeSingle()
      .then(({ data }) => {
        const v = (data?.value ?? {}) as { thank_you_message?: string };
        if (v.thank_you_message) setMessage(v.thank_you_message);
      });
  }, []);

  return (
    <main className="container-page py-16 md:py-24">
      <div className="max-w-xl mx-auto text-center">
        <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
          <Heart size={30} />
        </div>
        <h1 className="mt-5 text-3xl md:text-4xl font-extrabold text-foreground">Terima Kasih 🙏</h1>
        <p className="mt-3 text-muted-foreground">{message}</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-95 transition"
        >
          Kembali ke Beranda <ArrowRight size={16} />
        </Link>
      </div>
    </main>
  );
}
