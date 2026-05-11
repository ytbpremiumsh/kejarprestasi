import { createFileRoute } from "@tanstack/react-router";
import { RegistrationForm } from "@/components/RegistrationForm";

export const Route = createFileRoute("/pendaftaran/ekonomi")({
  head: () => ({
    meta: [
      { title: "Pendaftaran Beasiswa Ekonomi — Kejar Prestasi Section #3" },
      { name: "description", content: "Formulir pendaftaran Beasiswa Ekonomi Kejar Prestasi Section #3." },
    ],
  }),
  component: () => <RegistrationForm kind="ekonomi" />,
});
