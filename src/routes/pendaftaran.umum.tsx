import { createFileRoute } from "@tanstack/react-router";
import { RegistrationForm } from "@/components/RegistrationForm";

export const Route = createFileRoute("/pendaftaran/umum")({
  head: () => ({ meta: [
    { title: "Pendaftaran Beasiswa Umum — Kejar Prestasi" },
    { name: "description", content: "Formulir pendaftaran Beasiswa Umum Kejar Prestasi." },
  ] }),
  component: () => <RegistrationForm kind="umum" />,
});
