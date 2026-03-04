import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type AuthState = "loading" | "unauthenticated" | "authenticated";

export type ProtectedRouteContext = {
  user: User;
};

export function ProtectedRoute() {
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;

      if (!isMounted) return;

      if (!currentUser) {
        setUser(null);
        setAuthState("unauthenticated");
      } else {
        setUser(currentUser);
        setAuthState("authenticated");
      }
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkSession();
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (authState === "loading") {
    return <div className="p-6 text-center">Validando acceso...</div>;
  }

  if (authState === "unauthenticated") {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  // ⚠️ FUTURO:
  // Aquí podrías validar roles (owner, employee, etc.)
  // consultando una tabla profiles si decides escalar el sistema.

  return <Outlet context={{ user }} />;
}
