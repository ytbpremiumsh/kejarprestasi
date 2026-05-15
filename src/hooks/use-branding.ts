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

    const channel = supabase.channel("branding_settings");
    channel
      .on(
        "postgres_changes" as never,
        { event: "*", schema: "public", table: "site_settings", filter: "key=eq.branding" },
        (payload: { new?: { value: BrandingSettings }; old?: { value: BrandingSettings } }) => {
          const row = payload.new ?? payload.old;
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
