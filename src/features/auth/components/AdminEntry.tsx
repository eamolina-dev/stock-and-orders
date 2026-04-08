import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { getSession, subscribeToAuthChanges } from "../../../features/auth/services/session";
import { resolveClientBySlug } from "../../../features/clients/services/resolution";
import { ClientNotFound } from "../../../app/pages/ClientNotFound";

export default function AdminEntry() {
  const { clientSlug } = useParams<{ clientSlug: string }>();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [clientExists, setClientExists] = useState<boolean | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const syncSession = async () => {
      setError(null);

      try {
        const [session, client] = await Promise.all([
          getSession(),
          resolveClientBySlug(clientSlug),
        ]);

        if (!isMounted) return;
        setUser(session?.user ?? null);
        setClientExists(Boolean(client));
      } catch (syncError) {
        console.error("Error resolving admin entry", syncError);
        if (!isMounted) return;
        setUser(null);
        setClientExists(false);
        setError("Error al cargar los datos");
      }
    };

    void syncSession();

    const subscription = subscribeToAuthChanges((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [clientSlug]);

  if (!clientSlug || user === undefined || clientExists === undefined) {
    return <div className="p-6 text-center">Cargando...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  if (!clientExists) {
    return <ClientNotFound clientSlug={clientSlug} />;
  }

  if (!user) {
    return <Navigate to={`/${clientSlug}/admin/login`} replace />;
  }

  return <Navigate to={`/${clientSlug}/admin/dashboard`} replace />;
}
