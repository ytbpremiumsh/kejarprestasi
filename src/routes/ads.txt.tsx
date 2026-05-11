import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

export const Route = createFileRoute("/ads/txt")({
  server: {
    handlers: {
      GET: async () => {
        const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";
        const key =
          process.env.SUPABASE_PUBLISHABLE_KEY ??
          process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
          "";
        let body = "";
        try {
          if (url && key) {
            const sb = createClient(url, key);
            const { data } = await sb
              .from("site_settings")
              .select("value")
              .eq("key", "adsense")
              .maybeSingle();
            const v = data?.value as { ads_txt?: string } | null;
            body = (v?.ads_txt ?? "").toString();
          }
        } catch {
          body = "";
        }
        return new Response(body, {
          status: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=300",
          },
        });
      },
    },
  },
});
