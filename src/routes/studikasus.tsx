import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/studikasus")({
  beforeLoad: () => { throw redirect({ to: "/studi-kasus" }); },
});
