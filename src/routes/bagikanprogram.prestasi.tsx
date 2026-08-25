import { createFileRoute } from "@tanstack/react-router";
import { SharePosterPage } from "@/components/SharePosterPage";

export const Route = createFileRoute("/bagikanprogram/prestasi")({
  head: () => ({
    meta: [
      { title: "Bagikan Twibbon & Poster Beasiswa Prestasi — Kejar Prestasi" },
      { name: "description", content: "Buat Twibbon Beasiswa Prestasi dari foto sendiri, bagikan ke Instagram, lalu sebarkan poster resmi ke minimal 5 grup." },
    ],
  }),
  component: () => <SharePosterPage kind="prestasi" />,
});
