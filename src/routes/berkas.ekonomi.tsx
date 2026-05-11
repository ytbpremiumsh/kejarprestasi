import { createFileRoute } from "@tanstack/react-router";
import { BerkasPage } from "@/components/BerkasPage";

export const Route = createFileRoute("/berkas/ekonomi")({
  head: () => ({
    meta: [
      { title: "Pengiriman Berkas Ekonomi — Kejar Prestasi Section #3" },
      { name: "description", content: "Unggah berkas pendukung Beasiswa Ekonomi." },
    ],
  }),
  component: () => <BerkasPage kind="ekonomi" />,
});
