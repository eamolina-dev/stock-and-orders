import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

export async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Error getting session", error);
    throw error;
  }

  return session;
}

export async function signInWithPassword(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export function subscribeToAuthChanges(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  const { data } = supabase.auth.onAuthStateChange(callback);
  return data.subscription;
}
