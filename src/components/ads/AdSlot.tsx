import { useEffect, useRef } from "react";
import { useAdSettings } from "./AdSettings";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const formatToStyle: Record<string, React.CSSProperties> = {
  auto: { display: "block" },
  horizontal: { display: "block", width: "100%", height: 90 },
  rectangle: { display: "inline-block", width: 336, height: 280 },
  vertical: { display: "inline-block", width: 160, height: 600 },
};

export function AdSlot({ placement, className }: { placement: string; className?: string }) {
  const { adsense, slots, loaded } = useAdSettings();
  const ref = useRef<HTMLDivElement | null>(null);
  const pushedRef = useRef(false);

  const slot = slots.find((s) => s.placement === placement && s.enabled);
  const ready = loaded && adsense.enabled && !!adsense.publisher_id && !!slot;

  useEffect(() => {
    if (!ready || pushedRef.current) return;
    const t = window.setTimeout(() => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
      } catch {
        // adsbygoogle not yet available; will be retried on next mount
      }
    }, 200);
    return () => window.clearTimeout(t);
  }, [ready]);

  if (!ready || !slot) return null;

  const style = formatToStyle[slot.format] ?? formatToStyle.auto;

  return (
    <div
      ref={ref}
      className={`my-8 flex justify-center ${className ?? ""}`}
      aria-label="Iklan"
    >
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={adsense.publisher_id}
        data-ad-slot={slot.slot_id}
        data-ad-format={slot.format === "auto" ? "auto" : undefined}
        data-full-width-responsive={slot.format === "auto" ? "true" : undefined}
      />
    </div>
  );
}
