import { getSession } from "../../shared/auth/session";
import { getClientByName, getClientByOwner } from "./queries";
import type { Client } from "./types";
import { supabase } from "../../lib/supabase";

export async function resolveClientIdFromSession(): Promise<string | null> {
  const session = await getSession();
  const ownerUserId = session?.user?.id;

  if (!ownerUserId) return null;

  const client = await getClientByOwner(ownerUserId);
  return client?.id ?? null;
}

export async function resolvePublicClientId(): Promise<string | null> {
  const client = await getClientByName("toma");
  return client?.id ?? null;
}

// export async function resolvePublicClient(): Promise<Client | null> {
//   return getClientByName("toma");
// }

export async function resolvePublicClient(): Promise<Client | null> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", "457f2fef-c806-42a6-a011-192f78b105ad")
    .maybeSingle();

  if (error) throw error;

  return data;
}
