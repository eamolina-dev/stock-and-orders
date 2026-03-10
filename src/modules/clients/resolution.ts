import { getSession } from "../../shared/auth/session";
import { getClientByOwner, getClientBySlug } from "./queries";
import type { Client } from "./types";

export async function resolveClientIdFromSession(): Promise<string | null> {
  try {
    const session = await getSession();
    const ownerUserId = session?.user?.id;

    if (!ownerUserId) return null;

    const client = await getClientByOwner(ownerUserId);
    return client?.id ?? null;
  } catch (error) {
    console.error("Error resolving client id from session", error);
    return null;
  }
}

export async function resolveClientBySlug(
  clientSlug: string | undefined
): Promise<Client | null> {
  if (!clientSlug) return null;

  return getClientBySlug(clientSlug);
}
