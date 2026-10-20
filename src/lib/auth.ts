import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type AppRole = "superadmin" | "teacher" | "student";
export type AccountStatus = "active" | "disabled";

export interface AuthProfile {
  user_id: string;
  display_name: string;
  role: AppRole;
  status: AccountStatus;
  must_change_password: boolean;
}

function getClient() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Set the public VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }
  return supabase;
}

export async function signInWithPassword(email: string, password: string) {
  return getClient().auth.signInWithPassword({
    email: email.trim(),
    password,
  });
}

export async function signOut() {
  return getClient().auth.signOut();
}

export async function manageAccount(body: Record<string, unknown>) {
  return getClient().functions.invoke("manage-accounts", { body });
}

export async function getCurrentSession() {
  return getClient().auth.getSession();
}

/** Read authorization state from protected profiles, never editable user metadata. */
export async function getCurrentProfile(): Promise<AuthProfile | null> {
  const client = getClient();
  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  if (sessionError) throw sessionError;
  if (!sessionData.session) return null;

  const { data, error } = await client
    .from("profiles")
    .select("user_id, display_name, role, status, must_change_password")
    .eq("user_id", sessionData.session.user.id)
    .maybeSingle();

  if (error) throw error;
  return (data as AuthProfile | null) ?? null;
}

export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
) {
  const { data } = getClient().auth.onAuthStateChange(callback);
  return () => data.subscription.unsubscribe();
}
