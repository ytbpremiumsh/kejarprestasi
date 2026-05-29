import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type AdminState = {
  loading: boolean;
  isAdmin: boolean;
  email: string | null;
  userId: string | null;
};

export function useIsAdmin(): AdminState {
  const [state, setState] = useState<AdminState>({
    loading: true,
    isAdmin: false,
    email: null,
    userId: null,
  });

  useEffect(() => {
    let active = true;

    const check = async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!active) return;
      if (!sess.session) {
        setState({ loading: false, isAdmin: false, email: null, userId: null });
        return;
      }
      const userId = sess.session.user.id;
      const email = sess.session.user.email ?? null;
      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      if (!active) return;
      setState({ loading: false, isAdmin: !!role, email, userId });
    };

    check();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      check();
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
