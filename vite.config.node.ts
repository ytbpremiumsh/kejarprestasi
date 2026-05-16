// Vite config khusus build Node (VPS) — TANPA Cloudflare plugin.
// Lovable preview & publish tetap pakai vite.config.ts (Worker).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Matikan Cloudflare plugin → build SSR jadi target Node murni,
  // heap usage turun signifikan (anti-OOM di VPS).
  cloudflare: false,
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  environments: {
    client: {
      build: {
        outDir: "dist",
      },
    },
    server: {
      build: {
        outDir: ".node-server",
      },
    },
  },
  tanstackStart: {
    // Pakai entry Node yang membungkus handler dengan @hono/node-server
    // dan listen ke process.env.PORT.
    server: { entry: "server.node" },
  },
});
