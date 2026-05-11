import { createFileRoute } from "@tanstack/react-router";
import { BerkasPage } from "@/components/BerkasPage";

export const Route = createFileRoute("/berkas/ekonomi/upload")({
  head: () => ({
    meta: [
      { title: "Unggah Berkas Ekonomi — Kejar Prestasi Section #3" },
      { name: "description", content: "Unggah berkas pendukung Beasiswa Ekonomi." },
    ],
  }),
  component: () => <BerkasPage kind="ekonomi" />,
});
