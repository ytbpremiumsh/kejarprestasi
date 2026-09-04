import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MaintenancePage, type MaintenanceConfig } from "./MaintenancePage";

export function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<MaintenanceConfig | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const checkAdmin = useCallback(async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setIsAdmin(false);
      return;
    }

    const { data: role, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    setIsAdmin(!roleError && !!role);
  }, []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const { data: settings } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "maintenance")
        .maybeSingle();

      if (!active) return;
      setConfig((settings?.value as MaintenanceConfig) || null);
      await checkAdmin();
      if (active) setLoaded(true);
    };

    load();

    const maintenanceChannel = supabase
      .channel("maintenance_mode")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings", filter: "key=eq.maintenance" },
        (payload) => {
          const row = payload.new as { value?: MaintenanceConfig } | null;
          setConfig(row?.value || null);
        },
      )
      .subscribe();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => { void checkAdmin(); }, 0);
    });

    return () => {
      active = false;
      supabase.removeChannel(maintenanceChannel);
      authListener.subscription.unsubscribe();
    };
  }, [checkAdmin]);

  if (!loaded) {
    return <div className="grid min-h-screen place-items-center bg-background" role="status" aria-label="Memeriksa status website"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (config?.enabled && !isAdmin) return <MaintenancePage config={config} />;
  return <>{children}</>;
}
