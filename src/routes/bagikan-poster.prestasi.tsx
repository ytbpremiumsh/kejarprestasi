import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/bagikan-poster/prestasi")({
  beforeLoad: () => {
    throw redirect({ to: "/bagikanprogram/prestasi" as any, replace: true });
  },
});
