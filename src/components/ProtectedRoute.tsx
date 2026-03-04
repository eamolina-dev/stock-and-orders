import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type AuthState = "loading" | "unauthenticated" | "unauthorized" | "authorized";

type Profile = {
  role: string | null;
};

export type ProtectedRouteContext = {
  user: User;
};

export function ProtectedRoute() {
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const validateAccess = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user;

      if (!currentUser) {
        if (isMounted) {
          setUser(null);
          setAuthState("unauthenticated");
        }
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentUser.id)
        .maybeSingle<Profile>();

      if (error || profile?.role !== "owner") {
        if (isMounted) {
          setUser(currentUser);
          setAuthState("unauthorized");
        }
        return;
      }

      if (isMounted) {
        setUser(currentUser);
        setAuthState("authorized");
      }
    };

    validateAccess();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      validateAccess();
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

  if (authState === "unauthorized") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 px-4">
        <div className="max-w-md text-center space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">403</p>
          <h1 className="text-2xl font-semibold">Unauthorized</h1>
          <p className="text-zinc-300">No tenés permisos para acceder al panel administrativo.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet context={{ user }} />;
}
