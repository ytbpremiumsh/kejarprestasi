import { createFileRoute } from "@tanstack/react-router";
import { SharePosterPage } from "@/components/SharePosterPage";

export const Route = createFileRoute("/bagikanprogram/ekonomi")({
  head: () => ({
    meta: [
      { title: "Bagikan Twibbon & Poster Beasiswa Ekonomi — Kejar Prestasi" },
      { name: "description", content: "Buat Twibbon Beasiswa Ekonomi dari foto sendiri, bagikan ke Instagram, lalu sebarkan poster resmi ke minimal 5 grup." },
    ],
  }),
  component: () => <SharePosterPage kind="ekonomi" />,
});
