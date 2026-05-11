import { createFileRoute } from "@tanstack/react-router";
import { SharePosterPage } from "@/components/SharePosterPage";

export const Route = createFileRoute("/bagikan-poster/ekonomi")({
  head: () => ({
    meta: [
      { title: "Bagikan Poster Beasiswa Ekonomi — Kejar Prestasi Section #3" },
      { name: "description", content: "Bagikan poster Beasiswa Ekonomi Kejar Prestasi Section #3 ke WhatsApp, Instagram, Facebook, dan X." },
    ],
  }),
  component: () => <SharePosterPage kind="ekonomi" />,
});
