import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/CategoryPage";

export const Route = createFileRoute("/beasiswa-prestasi")({
  head: () => ({
    meta: [
      { title: "Jalur Prestasi — Kejar Prestasi Section #3" },
      { name: "description", content: "Jalur apresiasi pendidikan untuk pelajar dan mahasiswa yang aktif mengembangkan pencapaian akademik maupun non-akademik." },
      { property: "og:title", content: "Jalur Prestasi — Kejar Prestasi Section #3" },
      { property: "og:description", content: "Kenali manfaat, persiapan, dan tahapan untuk mengikuti jalur Prestasi Kejar Prestasi." },
    ],
  }),
  component: () => (
    <CategoryPage
      kind="prestasi"
      tagline="Jalur Prestasi"
      title="Ruang Tumbuh untuk Kamu yang Terus Berprestasi"
      desc="Punya pencapaian di sekolah, kampus, kompetisi, organisasi, seni, atau bidang lainnya? Jadikan perjalananmu sebagai modal untuk memperoleh dukungan pendidikan dan membangun jejaring baru."
      registerTo="/pendaftaran/prestasi"
      shareTo="/bagikan-poster/prestasi"
    />
  ),
});
