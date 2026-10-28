"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../../lib/client";

const AuthContext = createContext<{ user: User | null; loading: boolean }>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ user: User | null; loading: boolean }>({ user: null, loading: true });
  useEffect(() => {
    let active = true;
    let changed = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      changed = true;
      if (active) setState({ user: session?.user ?? null, loading: false });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (active && !changed) setState({ user: data.session?.user ?? null, loading: false });
    }).catch(() => { if (active && !changed) setState({ user: null, loading: false }); });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
