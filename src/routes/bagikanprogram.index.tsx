import { createFileRoute } from "@tanstack/react-router";
import { SharePosterPage } from "@/components/SharePosterPage";

export const Route = createFileRoute("/bagikanprogram/")({
  head: () => ({
    meta: [
      { title: "Bagikan Twibbon & Poster — Kejar Prestasi" },
      { name: "description", content: "Buat Twibbon pribadi, bagikan ke Instagram, dan sebarkan poster resmi Kejar Prestasi ke minimal 5 grup." },
    ],
  }),
  component: () => <SharePosterPage kind="prestasi" unified />,
});
