import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * Runs lightweight page lifecycle work after each SPA navigation. Ad injectors
 * also subscribe to the route, so their slots are recreated without forcing a
 * costly browser reload and re-downloading the application bundle.
 */
export function RouteLifecycle() {
  const href = useRouterState({ select: (state) => state.location.href });

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!window.location.hash) window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    const frame = window.requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent("kejarprestasi:route-ready", { detail: { href } }));
    });

    return () => window.cancelAnimationFrame(frame);
  }, [href]);

  return null;
}
