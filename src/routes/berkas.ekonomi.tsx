import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/berkas/ekonomi")({
  component: () => <Outlet />,
});