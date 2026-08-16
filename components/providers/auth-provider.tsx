"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User, Session, RealtimeChannel } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { Profile } from "@/lib/supabase";

// ─── Context type ─────────────────────────────────────────────────────────────

export interface ApplicationRecord {
  id: string;
  internship_id: string;
  status: "Pending" | "Submitted" | "Reviewing" | "Accepted" | "Rejected";
  match_score?: number;
  applied_at: string;
  created_at: string;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  applications: ApplicationRecord[];
  applicationCount: number;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  refreshApplications: () => Promise<void>;
  updateProfileLocally: (partial: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  profile: null,
  applications: [],
  applicationCount: 0,
  loading: true,
  refreshProfile: async () => {},
  refreshApplications: async () => {},
  updateProfileLocally: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = getSupabaseBrowserClient();

  const fetchProfile = useCallback(
    async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        if (!error && data) {
          setProfile(data as Profile);
        }
      } catch (e) {
        console.warn("[AuthProvider] Failed to fetch profile:", e);
      }
    },
    [supabase]
  );

  const fetchApplications = useCallback(
    async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("applications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        if (!error && data) {
          setApplications(data as ApplicationRecord[]);
        }
      } catch (e) {
        console.warn("[AuthProvider] Failed to fetch applications:", e);
      }
    },
    [supabase]
  );

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  const refreshApplications = useCallback(async () => {
    if (user) await fetchApplications(user.id);
  }, [user, fetchApplications]);

  const updateProfileLocally = useCallback((partial: Partial<Profile>) => {
    setProfile((prev) => (prev ? { ...prev, ...partial } : null));
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        Promise.all([
          fetchProfile(session.user.id),
          fetchApplications(session.user.id),
        ]).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchApplications(session.user.id);
      } else {
        setProfile(null);
        setApplications([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile, fetchApplications]);

  // ─── Realtime Subscriptions for Profiles & Applications ────────────────────
  useEffect(() => {
    if (!user?.id) return;

    let profileChannel: RealtimeChannel | null = null;
    let applicationChannel: RealtimeChannel | null = null;

    try {
      // 1. Live profile changes (updates instantly across all open pages/tabs)
      profileChannel = supabase
        .channel(`realtime-profile-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.new && typeof payload.new === "object") {
              setProfile(payload.new as Profile);
            }
          }
        )
        .subscribe();

      // 2. Live application changes (updates stats, notifications, applied status immediately)
      applicationChannel = supabase
        .channel(`realtime-applications-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "applications",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchApplications(user.id);
          }
        )
        .subscribe();
    } catch (e) {
      console.warn("[AuthProvider] Realtime subscription error:", e);
    }

    return () => {
      if (profileChannel) supabase.removeChannel(profileChannel);
      if (applicationChannel) supabase.removeChannel(applicationChannel);
    };
  }, [user?.id, supabase, fetchApplications]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        applications,
        applicationCount: applications.length,
        loading,
        refreshProfile,
        refreshApplications,
        updateProfileLocally,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  return useContext(AuthContext);
}
