import { useEffect, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import { resolveClientBySlug } from "../../features/clients/services/resolution";
import type { Client } from "../../features/clients/types";
import { ClientNotFound } from "../pages/ClientNotFound";

export type ClientShopLayoutContext = {
  client: Client;
  clientSlug: string;
};

export function ClientShopLayout() {
  const { clientSlug } = useParams<{ clientSlug: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadClient = async () => {
      setLoading(true);
      setError(null);

      try {
        const resolvedClient = await resolveClientBySlug(clientSlug);

        if (!isMounted) return;
        setClient(resolvedClient);
      } catch (clientError) {
        console.error("Error resolving client", clientError);
        if (!isMounted) return;
        setClient(null);
        setError("Error al cargar los datos");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadClient();

    return () => {
      isMounted = false;
    };
  }, [clientSlug]);

  if (loading) {
    return <div className="p-6 text-center">Cargando cliente...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  if (!client || !clientSlug) {
    return <ClientNotFound clientSlug={clientSlug} />;
  }

  return <Outlet context={{ client, clientSlug }} />;
}
