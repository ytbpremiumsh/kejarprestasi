import { createFileRoute } from "@tanstack/react-router";
import { BerkasPage } from "@/components/BerkasPage";

export const Route = createFileRoute("/berkas/prestasi/upload")({
  head: () => ({
    meta: [
      { title: "Unggah Berkas Prestasi — Kejar Prestasi Section #3" },
      { name: "description", content: "Unggah berkas pendukung Beasiswa Prestasi." },
    ],
  }),
  component: () => <BerkasPage kind="prestasi" />,
});
