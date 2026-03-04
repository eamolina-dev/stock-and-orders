import { getSession } from "../auth/session";
import { getClientByName, getClientByOwner } from "../../modules/clients/queries";
import type { Client } from "../../modules/clients/types";

export async function resolveClientIdFromSession(): Promise<string | null> {
  const session = await getSession();
  const ownerUserId = session?.user?.id;

  if (!ownerUserId) return null;

  const client = await getClientByOwner(ownerUserId);
  return client?.id ?? null;
}

export async function resolvePublicClientId(): Promise<string | null> {
  const client = await getClientByName("toma.");
  return client?.id ?? null;
}

export async function resolvePublicClient(): Promise<Client | null> {
  return getClientByName("toma.");
}
