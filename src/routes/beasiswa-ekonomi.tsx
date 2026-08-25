import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/CategoryPage";

export const Route = createFileRoute("/beasiswa-ekonomi")({
  head: () => ({
    meta: [
      { title: "Jalur Ekonomi — Kejar Prestasi Section #3" },
      { name: "description", content: "Jalur dukungan pendidikan bagi pelajar dan mahasiswa yang menghadapi keterbatasan finansial dalam melanjutkan studi." },
      { property: "og:title", content: "Jalur Ekonomi — Kejar Prestasi Section #3" },
      { property: "og:description", content: "Pelajari manfaat, persiapan, dan proses mengikuti jalur Ekonomi Kejar Prestasi." },
    ],
  }),
  component: () => (
    <CategoryPage
      kind="ekonomi"
      tagline="Jalur Ekonomi"
      title="Tetap Melangkah, Meski Kondisi Finansial Terbatas"
      desc="Program ini hadir untuk membantu peserta yang memiliki kebutuhan dukungan finansial agar dapat menjaga semangat belajar, melanjutkan pendidikan, dan membuka peluang masa depan yang lebih luas."
      registerTo="/pendaftaran/ekonomi"
      shareTo="/bagikan-poster/ekonomi"
    />
  ),
});
