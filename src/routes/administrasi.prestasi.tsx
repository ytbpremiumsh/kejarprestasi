import { createFileRoute } from "@tanstack/react-router";
import { BerkasPage } from "@/components/BerkasPage";

export const Route = createFileRoute("/administrasi/prestasi")({
  component: () => <BerkasPage kind="prestasi" />,
});
