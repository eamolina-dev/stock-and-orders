import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { getSession, subscribeToAuthChanges } from "../../../shared/auth/session";
import { resolveClientBySlug } from "../../../modules/clients/resolution";
import { ClientNotFound } from "../../../shared/pages/ClientNotFound";

type AuthState = "loading" | "unauthenticated" | "authenticated";

export type ProtectedRouteContext = {
  user: User;
  clientId: string;
  clientSlug: string;
};

export function ProtectedRoute() {
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientExists, setClientExists] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const { clientSlug } = useParams<{ clientSlug: string }>();

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      setError(null);

      try {
        const session = await getSession();
        const currentUser = session?.user ?? null;

        if (!isMounted) return;

        if (!clientSlug) {
          setClientExists(false);
          setUser(null);
          setClientId(null);
          setAuthState("unauthenticated");
          return;
        }

        const client = await resolveClientBySlug(clientSlug);

        if (!isMounted) return;

        if (!client || !client.id) {
          setClientExists(false);
          setUser(null);
          setClientId(null);
          setAuthState("unauthenticated");
          return;
        }

        setClientExists(true);

        if (!currentUser) {
          setUser(null);
          setClientId(null);
          setAuthState("unauthenticated");
          return;
        }

        setUser(currentUser);
        setClientId(client.id);
        setAuthState("authenticated");
      } catch (sessionError) {
        console.error("Error validating protected route", sessionError);
        if (!isMounted) return;
        setUser(null);
        setClientId(null);
        setAuthState("unauthenticated");
        setError("Error al cargar los datos");
      }
    };

    void checkSession();

    const subscription = subscribeToAuthChanges(() => {
      void checkSession();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [clientSlug]);

  if (authState === "loading") {
    return <div className="p-6 text-center">Validando acceso...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  if (!clientExists) {
    return <ClientNotFound clientSlug={clientSlug} />;
  }

  if (authState === "unauthenticated") {
    return (
      <Navigate
        to={`/${clientSlug}/admin/login`}
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  if (!user || !clientId || !clientSlug) {
    return <div className="p-6 text-center">Cargando cliente...</div>;
  }

  return <Outlet context={{ user, clientId, clientSlug }} />;
}
