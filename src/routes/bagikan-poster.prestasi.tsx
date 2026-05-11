import { createFileRoute } from "@tanstack/react-router";
import { SharePosterPage } from "@/components/SharePosterPage";

export const Route = createFileRoute("/bagikan-poster/prestasi")({
  head: () => ({
    meta: [
      { title: "Bagikan Poster Beasiswa Prestasi — Kejar Prestasi Section #3" },
      { name: "description", content: "Bagikan poster Beasiswa Prestasi Kejar Prestasi Section #3 ke WhatsApp, Instagram, Facebook, dan X." },
    ],
  }),
  component: () => <SharePosterPage kind="prestasi" />,
});
