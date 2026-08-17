import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile, InternshipItem, Application as ApplicationRecord } from "@/types";

// Re-export canonical types for callers that import from this module
export type { Profile, InternshipItem, ApplicationRecord };

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ─── Browser Client (client components) ──────────────────────────────────────
// Call this in client components. It handles cookie-based session automatically.
let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!browserClient) {
    const url = supabaseUrl || "https://placeholder.supabase.co";
    const key = supabaseAnonKey || "placeholder";
    browserClient = createBrowserClient(url, key);
  }
  return browserClient;
}

// Backwards-compat alias used by existing code
export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return getSupabaseBrowserClient();
}

// ─── Type helpers ─────────────────────────────────────────────────────────────
export type { SupabaseClient };

// Mock fallbacks removed

// ─── Profile helpers ──────────────────────────────────────────────────────────

export async function getProfileById(userId: string): Promise<Profile | null> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase client not initialized");

  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
    
  if (error) {
    console.error("[Supabase] Error fetching profile:", error);
    return null;
  }
  return data as Profile;
}

export async function upsertProfile(
  profileData: Partial<Profile> & { id?: string }
): Promise<Profile> {
  if (!profileData.id) throw new Error("Profile ID is required for upsert");

  const updated: Partial<Profile> = {
    ...profileData,
    updated_at: new Date().toISOString(),
  };

  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase client not initialized");

  const { data, error } = await client
    .from("profiles")
    .upsert(updated)
    .select()
    .single();

  if (error || !data) {
    console.error("[Supabase] Error upserting profile:", error);
    throw new Error(error?.message || "Failed to upsert profile");
  }

  return data as Profile;
}

// ─── Internship helpers ───────────────────────────────────────────────────────

export async function getAllInternships(
  search?: string,
  category?: string
): Promise<InternshipItem[]> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase client not initialized");

  let query = client.from("internships").select("*").order("created_at", { ascending: false });
  if (category) query = query.eq("category", category);
  if (search) query = query.ilike("title", `%${search}%`);
  
  const { data, error } = await query;
  if (error) {
    console.error("[Supabase] Error fetching internships:", error);
    throw new Error(error.message);
  }
  
  return data as InternshipItem[] || [];
}

export async function createInternship(
  internship: Omit<InternshipItem, "id" | "created_at">
): Promise<InternshipItem> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase client not initialized");

  const newInternship = {
    ...internship,
    status: internship.status || "Open",
  };

  const { data, error } = await client
    .from("internships")
    .insert(newInternship)
    .select()
    .single();

  if (error || !data) {
    console.error("[Supabase] Error creating internship:", error);
    throw new Error(error?.message || "Failed to create internship");
  }

  return data as InternshipItem;
}

// ─── Application helpers ──────────────────────────────────────────────────────

export async function getUserApplications(userId: string): Promise<ApplicationRecord[]> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase client not initialized");

  const { data, error } = await client
    .from("applications")
    .select("*")
    .eq("user_id", userId);
    
  if (error) {
    console.error("[Supabase] Error fetching applications:", error);
    throw new Error(error.message);
  }
  
  return data as ApplicationRecord[] || [];
}
