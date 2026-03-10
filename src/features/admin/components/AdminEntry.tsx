import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { getSession, subscribeToAuthChanges } from "../../../shared/auth/session";

export default function AdminEntry() {
  const { clientSlug } = useParams<{ clientSlug: string }>();
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;

    const syncSession = async () => {
      const session = await getSession();
      if (!isMounted) return;
      setUser(session?.user ?? null);
    };

    syncSession();

    const subscription = subscribeToAuthChanges((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (!clientSlug || user === undefined) {
    return <div className="p-6 text-center">Cargando...</div>;
  }

  if (!user) {
    return <Navigate to={`/${clientSlug}/admin/login`} replace />;
  }

  return <Navigate to={`/${clientSlug}/admin/dashboard`} replace />;
}
