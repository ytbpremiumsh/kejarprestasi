import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/berkas/prestasi")({
  component: () => <Outlet />,
});