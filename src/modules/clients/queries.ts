import { supabase } from "../../lib/supabase";
import type { Client } from "./types";

export async function getClientByOwner(userId: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("owner_user_id", userId)
    .maybeSingle();

  if (error) throw error;

  return data;
}
