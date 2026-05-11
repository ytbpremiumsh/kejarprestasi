import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AdSenseConfig = {
  enabled: boolean;
  publisher_id: string;
  ads_txt: string;
};

export type AdSlotConfig = {
  id: string;
  name: string;
  slot_id: string;
  placement: string;
  format: "auto" | "horizontal" | "rectangle" | "vertical";
  enabled: boolean;
};

type Ctx = {
  adsense: AdSenseConfig;
  slots: AdSlotConfig[];
  loaded: boolean;
};

const AdSettingsContext = createContext<Ctx>({
  adsense: { enabled: false, publisher_id: "", ads_txt: "" },
  slots: [],
  loaded: false,
});

export function AdSettingsProvider({ children }: { children: ReactNode }) {
  const [adsense, setAdsense] = useState<AdSenseConfig>({
    enabled: false,
    publisher_id: "",
    ads_txt: "",
  });
  const [slots, setSlots] = useState<AdSlotConfig[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("site_settings")
      .select("key,value")
      .in("key", ["adsense", "ad_slots"])
      .then(({ data }) => {
        if (cancelled || !data) return;
        const a = data.find((d) => d.key === "adsense")?.value as AdSenseConfig | undefined;
        const s = data.find((d) => d.key === "ad_slots")?.value as AdSlotConfig[] | undefined;
        if (a) setAdsense(a);
        if (Array.isArray(s)) setSlots(s);
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AdSettingsContext.Provider value={{ adsense, slots, loaded }}>
      {children}
    </AdSettingsContext.Provider>
  );
}

export function useAdSettings() {
  return useContext(AdSettingsContext);
}

/**
 * Loads the AdSense script tag once when AdSense is enabled and a publisher ID is set.
 * Safe to mount once at the application root.
 */
export function AdsenseLoader() {
  const { adsense, loaded } = useAdSettings();

  useEffect(() => {
    if (!loaded) return;
    if (!adsense.enabled || !adsense.publisher_id) return;
    if (typeof document === "undefined") return;
    if (document.getElementById("adsense-script")) return;

    const s = document.createElement("script");
    s.id = "adsense-script";
    s.async = true;
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(adsense.publisher_id)}`;
    s.crossOrigin = "anonymous";
    document.head.appendChild(s);
  }, [loaded, adsense.enabled, adsense.publisher_id]);

  return null;
}
