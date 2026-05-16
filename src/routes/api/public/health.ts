// Health check endpoint untuk PM2 / Nginx / uptime monitor.
// GET /api/public/health → 200 OK { status, uptime, ts }
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/health")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(
          JSON.stringify({
            status: "ok",
            uptime: typeof process !== "undefined" ? process.uptime?.() ?? 0 : 0,
            ts: Date.now(),
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
              "cache-control": "no-store",
            },
          },
        );
      },
    },
  },
});
