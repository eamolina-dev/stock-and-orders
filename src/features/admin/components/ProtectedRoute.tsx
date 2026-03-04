import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { getSession, subscribeToAuthChanges } from "../../../core/auth/session";
import { getClientByOwner } from "../../../modules/clients/queries";

type AuthState = "loading" | "unauthenticated" | "authenticated";

export type ProtectedRouteContext = {
  user: User;
  clientId: string;
};

export function ProtectedRoute() {
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      const session = await getSession();
      const currentUser = session?.user ?? null;

      if (!isMounted) return;

      if (!currentUser) {
        setUser(null);
        setClientId(null);
        setAuthState("unauthenticated");
      } else {
        const client = await getClientByOwner(currentUser.id);

        if (!client) {
          setUser(null);
          setClientId(null);
          setAuthState("unauthenticated");
          return;
        }

        setUser(currentUser);
        setClientId(client.id);
        setAuthState("authenticated");
      }
    };

    checkSession();

    const subscription = subscribeToAuthChanges(() => {
      checkSession();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
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

  if (!user || !clientId) {
    return <div className="p-6 text-center">Cargando cliente...</div>;
  }

  // ⚠️ FUTURO:
  // Aquí podrías validar roles (owner, employee, etc.)
  // consultando una tabla profiles si decides escalar el sistema.

  return <Outlet context={{ user, clientId }} />;
}
