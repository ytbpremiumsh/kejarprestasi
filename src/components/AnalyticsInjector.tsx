import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

type AnalyticsSettings = {
  ga_measurement_id?: string;
  enabled?: boolean;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const SCRIPT_MARK = "data-ga-injection";

function removeGA() {
  document.querySelectorAll(`[${SCRIPT_MARK}]`).forEach((n) => n.remove());
}

function injectGA(id: string) {
  removeGA();
  if (!id) return;
  const loader = document.createElement("script");
  loader.async = true;
  loader.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  loader.setAttribute(SCRIPT_MARK, "1");
  document.head.appendChild(loader);

  const inline = document.createElement("script");
  inline.setAttribute(SCRIPT_MARK, "1");
  inline.text = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', '${id}', { send_page_view: false });
  `;
  document.head.appendChild(inline);
}

export function AnalyticsInjector() {
  const idRef = useRef<string>("");
  const href = useRouterState({ select: (s) => s.location.href });

  // Load + subscribe to settings
  useEffect(() => {
    let active = true;
    const apply = (cfg: AnalyticsSettings | null) => {
      if (!active) return;
      const enabled = cfg?.enabled !== false;
      const id = (cfg?.ga_measurement_id || "").trim();
      idRef.current = enabled ? id : "";
      if (idRef.current) injectGA(idRef.current);
      else removeGA();
    };

    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "analytics")
        .maybeSingle();
      apply((data?.value ?? null) as AnalyticsSettings | null);
    })();

    const channel = supabase
      .channel("analytics_settings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings", filter: "key=eq.analytics" },
        (payload) => {
          const row = (payload.new ?? payload.old) as { value: AnalyticsSettings } | null;
          apply(row?.value ?? null);
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Page-view tracking on route change
  useEffect(() => {
    const id = idRef.current;
    if (!id || typeof window === "undefined" || !window.gtag) return;
    window.gtag("event", "page_view", {
      page_location: window.location.href,
      page_title: document.title,
      send_to: id,
    });
  }, [href]);

  return null;
}
