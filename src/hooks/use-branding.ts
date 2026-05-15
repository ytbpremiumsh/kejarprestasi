import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import defaultLogo from "@/assets/logo-kp.png";

export type BrandingSettings = {
  header_logo_url?: string;
  footer_logo_url?: string;
};

export function useBranding() {
  const [branding, setBranding] = useState<BrandingSettings>({});

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "branding")
        .maybeSingle();
      if (active && data?.value) setBranding(data.value as BrandingSettings);
    })();

    const channel = supabase
      .channel("branding_settings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings", filter: "key=eq.branding" },
        (payload) => {
          const row = (payload.new ?? payload.old) as { value: BrandingSettings } | null;
          if (row?.value) setBranding(row.value);
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    headerLogo: branding.header_logo_url || defaultLogo,
    footerLogo: branding.footer_logo_url || branding.header_logo_url || defaultLogo,
  };
}
