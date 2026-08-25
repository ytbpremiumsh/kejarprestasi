import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/bagikan-poster/ekonomi")({
  beforeLoad: () => {
    throw redirect({ to: "/bagikanprogram/ekonomi" as any, replace: true });
  },
});
