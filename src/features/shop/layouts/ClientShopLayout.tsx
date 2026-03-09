import { useEffect, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import { resolveClientBySlug } from "../../../modules/clients/resolution";
import type { Client } from "../../../modules/clients/types";

export type ClientShopLayoutContext = {
  client: Client;
  clientSlug: string;
};

export function ClientShopLayout() {
  const { clientSlug } = useParams<{ clientSlug: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadClient = async () => {
      setLoading(true);
      const resolvedClient = await resolveClientBySlug(clientSlug);

      console.log(resolvedClient);
      if (!isMounted) return;

      setClient(resolvedClient);
      setLoading(false);
    };

    loadClient();

    return () => {
      isMounted = false;
    };
  }, [clientSlug]);

  if (loading) {
    return <div className="p-6 text-center">Cargando cliente...</div>;
  }

  if (!client || !clientSlug) {
    return <div className="p-6 text-center">Client not found</div>;
  }

  return <Outlet context={{ client, clientSlug }} />;
}
