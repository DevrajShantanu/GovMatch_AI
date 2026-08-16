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

// ─── DB Helper Methods (with mock fallback for offline/dev) ───────────────────

// ─── Mock fallback data (used when Supabase is unreachable) ───────────────────

const mockProfilesDB: Record<string, Profile> = {
  usr_101: {
    id: "usr_101",
    full_name: "Aarav Sharma",
    email: "aarav.sharma@iitd.ac.in",
    role: "STUDENT",
    college: "IIT Delhi",
    degree: "B.Tech Computer Science",
    graduation_year: 2026,
    location: "New Delhi",
    bio: "Passionate about AI ethics, full-stack development, and government technology solutions.",
    skills: ["Python", "Next.js", "TypeScript", "React", "SQL", "NLP"],
    education: "B.Tech CS at IIT Delhi (2022-2026)",
    experience: "Software Intern at TechCorp, AI Research Lead at Campus AI Club",
    created_at: new Date().toISOString(),
  },
};

const mockInternshipsDB: InternshipItem[] = [
  {
    id: "int_01",
    title: "AI Policy & Governance Research Intern",
    organization: "NITI Aayog",
    ministry_or_department: "Frontier Technologies Vertical",
    location: "New Delhi",
    type: "Hybrid",
    stipend: 25000,
    stipend_period: "Monthly",
    duration: "6 Months",
    category: "AI & Public Policy",
    description: "Work directly with government tech advisors on frameworks for ethical AI deployment and governance.",
    required_skills: ["Python", "NLP", "Public Policy", "Data Science"],
    status: "Open",
    openings: 5,
    created_at: new Date().toISOString(),
  },
  {
    id: "int_02",
    title: "Full Stack Web Developer Intern",
    organization: "National Informatics Centre (NIC)",
    ministry_or_department: "Ministry of Electronics & IT",
    location: "Remote",
    type: "Remote",
    stipend: 20000,
    stipend_period: "Monthly",
    duration: "3 Months",
    category: "Software Engineering",
    description: "Develop citizen-facing portals and scalable Next.js API backends for public sector services.",
    required_skills: ["Next.js", "TypeScript", "React", "Node.js", "SQL"],
    status: "Open",
    openings: 10,
    created_at: new Date().toISOString(),
  },
];

const mockApplicationsDB: ApplicationRecord[] = [];

// ─── Profile helpers ──────────────────────────────────────────────────────────

export async function getProfileById(userId: string): Promise<Profile | null> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (!error && data) return data as Profile;
    } catch (e) {
      console.warn("[Supabase] Error fetching profile, falling back to mock:", e);
    }
  }
  return mockProfilesDB[userId] || mockProfilesDB["usr_101"] || null;
}

export async function upsertProfile(
  profileData: Partial<Profile> & { id?: string }
): Promise<Profile> {
  const id = profileData.id || "usr_101";
  const updated: Profile = {
    ...(mockProfilesDB[id] || {
      id,
      full_name: "Anonymous Candidate",
      email: "candidate@example.com",
      skills: [],
      created_at: new Date().toISOString(),
    }),
    ...profileData,
    updated_at: new Date().toISOString(),
  };

  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from("profiles")
        .upsert(updated)
        .select()
        .single();
      if (!error && data) return data as Profile;
    } catch (e) {
      console.warn("[Supabase] Error upserting profile, using fallback DB:", e);
    }
  }

  mockProfilesDB[id] = updated;
  return updated;
}

// ─── Internship helpers ───────────────────────────────────────────────────────

export async function getAllInternships(
  search?: string,
  category?: string
): Promise<InternshipItem[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      let query = client.from("internships").select("*").order("created_at", { ascending: false });
      if (category) query = query.eq("category", category);
      if (search) query = query.ilike("title", `%${search}%`);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as InternshipItem[];
    } catch (e) {
      console.warn("[Supabase] Error fetching internships, using fallback list:", e);
    }
  }

  let list = [...mockInternshipsDB];
  if (category)
    list = list.filter((item) => item.category?.toLowerCase() === category.toLowerCase());
  if (search) {
    const s = search.toLowerCase();
    list = list.filter(
      (item) =>
        item.title.toLowerCase().includes(s) ||
        item.organization.toLowerCase().includes(s)
    );
  }
  return list;
}

export async function createInternship(
  internship: Omit<InternshipItem, "id" | "created_at">
): Promise<InternshipItem> {
  const newInternship: InternshipItem = {
    ...internship,
    id: `int_${Date.now()}`,
    status: internship.status || "Open",
    created_at: new Date().toISOString(),
  };

  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from("internships")
        .insert(newInternship)
        .select()
        .single();
      if (!error && data) return data as InternshipItem;
    } catch (e) {
      console.warn("[Supabase] Error creating internship, saving to mock DB:", e);
    }
  }

  mockInternshipsDB.unshift(newInternship);
  return newInternship;
}

// ─── Application helpers ──────────────────────────────────────────────────────

export async function getUserApplications(userId: string): Promise<ApplicationRecord[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from("applications")
        .select("*")
        .eq("user_id", userId);
      if (!error && data) return data as ApplicationRecord[];
    } catch (e) {
      console.warn("[Supabase] Error fetching applications:", e);
    }
  }
  return mockApplicationsDB.filter((app) => app.user_id === userId);
}
