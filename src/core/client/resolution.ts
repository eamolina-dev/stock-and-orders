import { config } from "../../config";
import { getSession } from "../auth/session";
import { getClientByOwner } from "../../modules/clients/queries";

export async function resolveClientIdFromSession(): Promise<string | null> {
  const session = await getSession();
  const ownerUserId = session?.user?.id;

  if (!ownerUserId) return null;

  const client = await getClientByOwner(ownerUserId);
  return client?.id ?? null;
}

export async function resolvePublicClientId(): Promise<string | null> {
  const clientIdFromSession = await resolveClientIdFromSession();
  if (clientIdFromSession) return clientIdFromSession;

  return config.clientId;
}
