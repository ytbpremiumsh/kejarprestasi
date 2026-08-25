import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/bagikan-poster/")({
  beforeLoad: () => {
    throw redirect({ to: "/bagikanprogram/" as any, replace: true });
  },
});
