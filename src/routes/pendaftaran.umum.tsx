import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/pendaftaran/umum")({
  beforeLoad: () => { throw redirect({ to: "/pendaftaran-umum" }); },
});
