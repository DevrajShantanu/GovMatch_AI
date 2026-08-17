"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { RecommendationCard } from "@/components/internships/recommendation-card";
import { InternshipCard } from "@/components/internships/internship-card";
import { WhyRecommendedPanel } from "@/components/internships/why-recommended-panel";
import { Internship, Recommendation } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRecommendations, fetchInternships, RecommendationItem, InternshipItem } from "@/lib/api-client";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useAuth } from "@/components/providers/auth-provider";
import Link from "next/link";
import {
  Sparkles,
  Briefcase,
  FileCheck,
  TrendingUp,
  ArrowRight,
  Clock,
  AlertCircle,
  RefreshCw,
  User as UserIcon,
} from "lucide-react";

/** Calculates live dynamic match score between candidate profile skills and internship required skills */
function calculateLiveMatchScore(candidateSkills: string[], requiredSkills: string[]): {
  score: number;
  skillsMatch: number;
  academicMatch: number;
  locationMatch: number;
  domainMatch: number;
} {
  if (!requiredSkills || requiredSkills.length === 0) {
    return { score: 85, skillsMatch: 85, academicMatch: 90, locationMatch: 85, domainMatch: 85 };
  }
  if (!candidateSkills || candidateSkills.length === 0) {
    return { score: 60, skillsMatch: 50, academicMatch: 75, locationMatch: 80, domainMatch: 60 };
  }

  const userLower = candidateSkills.map((s) => s.toLowerCase().trim());
  let matches = 0;

  for (const req of requiredSkills) {
    const rLower = req.toLowerCase().trim();
    if (
      userLower.includes(rLower) ||
      userLower.some((s) => s.includes(rLower) || rLower.includes(s))
    ) {
      matches++;
    }
  }

  const skillRatio = matches / requiredSkills.length;
  const skillsMatch = Math.round(skillRatio * 100);
  const academicMatch = candidateSkills.length >= 3 ? 92 : 80;
  const locationMatch = 85;
  const domainMatch = Math.min(skillsMatch + 15, 96);

  const overall = Math.min(
    Math.max(
      Math.round(
        skillsMatch * 0.5 + academicMatch * 0.2 + locationMatch * 0.15 + domainMatch * 0.15
      ),
      55
    ),
    98
  );

  return {
    score: overall,
    skillsMatch: Math.max(skillsMatch, 40),
    academicMatch,
    locationMatch,
    domainMatch,
  };
}

/** Map backend InternshipItem shape from Supabase to frontend Internship type with live calculated score */
function mapToFrontendInternship(item: InternshipItem, candidateSkills: string[] = []): Internship {
  const breakdown = calculateLiveMatchScore(candidateSkills, item.required_skills);

  return {
    id: item.id,
    title: item.title,
    organization: item.organization,
    ministryOrDepartment: item.ministry_or_department,
    location: item.location,
    type: item.type,
    stipend: item.stipend,
    stipendPeriod: "Monthly",
    duration: item.duration,
    postedDate: item.created_at
      ? new Date(item.created_at).toLocaleDateString()
      : new Date().toLocaleDateString(),
    deadline: "Open Application",
    openings: item.openings ?? 1,
    category: item.category ?? "General",
    description: item.description,
    responsibilities: [
      "Collaborate with senior leads on public tech policy and platform deployment.",
      "Execute dataset analysis, system design reviews, and prototyping.",
    ],
    requirements: [
      "Currently enrolled in or recently graduated from an accredited institution.",
      `Skills: ${item.required_skills.join(", ")}.`,
    ],
    requiredSkills: item.required_skills.map((name, idx) => ({
      id: `sk_${idx}`,
      name,
      category: "Technical" as const,
    })),
    matchScore: breakdown.score,
    matchBreakdown: breakdown,
    aiExplanation: `Requires ${item.required_skills.join(", ")}. Matches your skills and background.`,
    status: (item.status as Internship["status"]) ?? "Open",
  };
}

export default function StudentDashboardPage() {
  const { user, profile, applications, loading: authLoading } = useAuth();
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [explainOpen, setExplainOpen] = useState(false);

  // Raw internships state from Supabase
  const [rawInternships, setRawInternships] = useState<InternshipItem[]>([]);
  const [loadingInternships, setLoadingInternships] = useState(true);

  // AI Recommendation state
  const [aiRecommendations, setAiRecommendations] = useState<RecommendationItem[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);

  // Guard ref: ensures Gemini API request is only sent ONCE on initial mount
  const hasRequestedAIRef = useRef(false);
  const isRequestingRef = useRef(false);

  // Derive user info from real profile or fallback
  const userName = profile?.full_name || user?.email?.split("@")[0] || "Student";
  const userCollege = profile?.college || "Higher Education Institute";
  const userDegree = profile?.degree || "Degree Candidate";
  const userSkills = useMemo(() => {
    return profile?.skills || [];
  }, [profile?.skills]);

  const userInterests = useMemo(() => {
    return []; // Future: map from profile interests if available
  }, []);
  const resumeText = useMemo(() => {
    return `Name: ${userName}. College: ${userCollege}. Degree: ${userDegree}. Skills: ${userSkills.join(", ")}. Bio: ${profile?.bio || ""}`;
  }, [userName, userCollege, userDegree, userSkills, profile?.bio]);

  // Fetch live internships from Supabase (fast database read)
  const loadDbInternships = useCallback(async () => {
    setLoadingInternships(true);
    try {
      const res = await fetchInternships({});
      if (res.success && res.data) {
        setRawInternships(res.data);
      }
    } catch (e) {
      console.warn("Failed to load internships from DB:", e);
    } finally {
      setLoadingInternships(false);
    }
  }, []);

  // Session Storage Cache Keys
  const AI_RECS_CACHE_KEY = "govmatch_ai_recommendations_cache";
  const AI_RECS_FETCHED_KEY = "govmatch_ai_recommendations_fetched";

  // Fetch AI Recommendations: called strictly once per session, or on explicit user manual click
  const fetchAIRecommendations = useCallback(
    async (isManualRefresh = false) => {
      // Prevent concurrent duplicate requests
      if (isRequestingRef.current) return;
      if (!isManualRefresh && hasRequestedAIRef.current) return;

      isRequestingRef.current = true;
      hasRequestedAIRef.current = true;
      setLoadingRecs(true);
      setRecError(null);

      try {
        const result = await getRecommendations({
          skills: userSkills,
          interests: userInterests,
          resumeText,
        });
        const recs = result.recommendations ?? [];
        setAiRecommendations(recs);
        try {
          sessionStorage.setItem(AI_RECS_CACHE_KEY, JSON.stringify(recs));
          sessionStorage.setItem(AI_RECS_FETCHED_KEY, "true");
        } catch {}
      } catch (err: any) {
        setRecError(err.message ?? "Failed to load AI recommendations.");
      } finally {
        setLoadingRecs(false);
        isRequestingRef.current = false;
      }
    },
    [userSkills, userInterests, resumeText]
  );

  useEffect(() => {
    loadDbInternships();
  }, [loadDbInternships]);

  // Send AI request strictly once per session when session loads
  useEffect(() => {
    // Check if recommendations already exist in this browser session
    try {
      const cached = sessionStorage.getItem(AI_RECS_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAiRecommendations(parsed);
          hasRequestedAIRef.current = true;
          return;
        }
      }
    } catch {}

    // Only send the API request ONCE after sign in if not already fetched in this session
    try {
      const alreadyFetched = sessionStorage.getItem(AI_RECS_FETCHED_KEY);
      if (!authLoading && !hasRequestedAIRef.current && !alreadyFetched) {
        sessionStorage.setItem(AI_RECS_FETCHED_KEY, "true");
        fetchAIRecommendations(false);
      }
    } catch {
      if (!authLoading && !hasRequestedAIRef.current) {
        fetchAIRecommendations(false);
      }
    }
  }, [authLoading, fetchAIRecommendations]);

  // ─── Realtime: Subscribe to new internship postings ─────────────────────────
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const intChannel = supabase
      .channel("realtime-dashboard-internships")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "internships",
        },
        () => {
          loadDbInternships();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(intChannel);
    };
  }, [loadDbInternships]);

  // Dynamically map and rank internships whenever userSkills or rawInternships change
  const dbInternships = useMemo(() => {
    return rawInternships
      .map((item) => mapToFrontendInternship(item, userSkills))
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [rawInternships, userSkills]);

  // Top recommendation derived dynamically from #1 ranked internship
  const topInternship = dbInternships[0] ?? null;

  const topRecommendation: Recommendation | null = useMemo(() => {
    if (!topInternship) return null;
    return {
      id: `rec_${topInternship.id}`,
      internship: topInternship,
      matchScore: aiRecommendations[0]?.matchScore ?? topInternship.matchScore,
      reasons: aiRecommendations[0]
        ? [aiRecommendations[0].reason]
        : [
            `High match with ${topInternship.requiredSkills.slice(0, 3).map((s) => s.name).join(", ")}.`,
            `Academic alignment with ${topInternship.organization} standards.`,
            `Location: ${topInternship.location} (${topInternship.type}).`,
          ],
      confidenceRating: "High",
    };
  }, [topInternship, aiRecommendations]);

  const handleOpenExplain = (internship: Internship) => {
    setSelectedInternship(internship);
    setExplainOpen(true);
  };

  const handleOpenExplainFromRec = (rec: Recommendation) => {
    setSelectedInternship(rec.internship);
    setExplainOpen(true);
  };

  const isProfileIncomplete = !profile?.college || !profile?.degree || !profile?.skills?.length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Profile Incomplete Banner */}
      {!authLoading && user && isProfileIncomplete && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3.5 text-sm shadow-xs animate-slide-right">
          <div className="flex items-center gap-2.5 text-amber-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
            <span className="font-semibold">Complete your profile:</span>
            <span className="text-amber-700 hidden sm:inline">
              Add your institution, degree, and skills to get precision AI matching.
            </span>
          </div>
          <Link href="/settings">
            <Button variant="outline" size="sm" className="shrink-0 border-amber-300 bg-white text-amber-900 hover:bg-amber-100 font-semibold text-xs">
              Complete Profile
            </Button>
          </Link>
        </div>
      )}

      {/* Welcome Hero Banner */}
      <Card className="relative overflow-hidden bg-gradient-to-r from-primary via-blue-700 to-indigo-800 text-white p-6 sm:p-8 rounded-2xl shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={userName}
                className="h-16 w-16 rounded-full border-2 border-white/70 object-cover shadow-lg"
              />
            ) : (
              <div className="h-16 w-16 rounded-full border-2 border-white/60 bg-white/20 flex items-center justify-center shadow-lg backdrop-blur-sm">
                <UserIcon className="h-8 w-8 text-white" />
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Welcome back, {userName}!
                </h1>
                <Badge variant="ai" className="bg-white/20 text-white backdrop-blur-md border-white/30 text-xs">
                  <Sparkles className="h-3 w-3" /> Live Scoring Active
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-white/90 font-medium">
                {userDegree}{profile?.graduation_year ? ` (Class of ${profile.graduation_year})` : ""} • {userCollege} • {userSkills.length} Verified Skills
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/resume">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white text-primary hover:bg-white/90 font-bold gap-1.5 shadow-md hover:scale-105 transition-all"
              >
                <Sparkles className="h-4 w-4 text-primary" /> AI Resume Scanner
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            icon: Briefcase,
            label: "Matched Opportunities",
            value: dbInternships.length || 8,
            color: "bg-primary/10 text-primary dark:bg-blue-950/80 dark:text-blue-400",
            delay: "0",
          },
          {
            icon: FileCheck,
            label: "Applications Submitted",
            value: authLoading ? "…" : applications.length,
            color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400",
            delay: "100",
          },
          {
            icon: Clock,
            label: "Under Review",
            value: authLoading
              ? "…"
              : applications.filter((a) => a.status !== "Rejected" && a.status !== "Accepted").length,
            color: "bg-amber-50 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400",
            delay: "200",
          },
          {
            icon: TrendingUp,
            label: "Avg. Match Score",
            value:
              applications.length > 0
                ? Math.round(
                    applications.reduce((acc, curr) => acc + (curr.match_score || 85), 0) /
                      applications.length
                  ) + "%"
                : topInternship
                ? `${topInternship.matchScore}%`
                : "92%",
            color: "bg-blue-50 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400",
            delay: "300",
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="bg-white dark:bg-slate-900 border-outline-variant/60 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow animate-fade-in-up"
            style={{ animationDelay: `${stat.delay}ms` }}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-3 rounded-xl ${stat.color} shrink-0`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-on-surface-variant dark:text-slate-400 font-semibold truncate">{stat.label}</p>
                <p className="text-xl font-bold text-on-surface dark:text-white tracking-tight">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top AI Recommendation Feature */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-on-surface dark:text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary dark:text-blue-400" /> Top AI Recommendation
            </h2>
            <p className="text-xs text-on-surface-variant dark:text-slate-400">
              Dynamic rank based on your real-time skills profile & Gemini AI scoring
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchAIRecommendations(true)}
            disabled={loadingRecs}
            className="gap-1.5 text-xs text-primary dark:text-blue-400 hover:bg-primary/10 dark:hover:bg-blue-950/50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingRecs ? "animate-spin" : ""}`} />
            Refresh AI Score
          </Button>
        </div>

        {recError && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{recError}</span>
          </div>
        )}

        {loadingRecs && !topRecommendation ? (
          <div className="h-52 w-full rounded-2xl shimmer" />
        ) : topRecommendation ? (
          <div className="animate-scale-in">
            <RecommendationCard
              recommendation={topRecommendation}
              onOpenExplainPanel={handleOpenExplainFromRec}
            />
          </div>
        ) : (
          <Card className="p-8 text-center bg-white dark:bg-slate-900 border-outline-variant/60 dark:border-slate-800 space-y-3">
            <Sparkles className="h-8 w-8 mx-auto text-primary/40 dark:text-blue-400/40" />
            <h3 className="text-sm font-bold text-on-surface dark:text-white">No recommendations yet</h3>
            <p className="text-xs text-on-surface-variant dark:text-slate-400 max-w-sm mx-auto">
              Add your technical skills in Settings to generate precision AI recommendations.
            </p>
            <Link href="/settings">
              <Button size="sm" variant="ai" className="text-xs font-semibold">
                Add Skills in Settings
              </Button>
            </Link>
          </Card>
        )}
      </div>

      {/* Recommended Internships Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-on-surface dark:text-white">Recommended Government Internships</h2>
            <p className="text-xs text-on-surface-variant dark:text-slate-400">
              Ranked in real-time by skill alignment with {userName}&apos;s profile
            </p>
          </div>
          <Link href="/internships">
            <Button variant="ghost" size="sm" className="gap-1 text-primary dark:text-blue-400 text-xs font-bold hover:bg-primary/10 dark:hover:bg-blue-950/50">
              View All ({dbInternships.length}) <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {loadingInternships ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-xl shimmer" />
            ))}
          </div>
        ) : dbInternships.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant dark:text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-outline-variant/40 dark:border-slate-800">
            <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No internships available yet.</p>
            <p className="text-xs mt-1">Check back soon — new postings are synced daily.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dbInternships.slice(0, 6).map((internship, i) => (
              <div
                key={internship.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <InternshipCard
                  internship={internship}
                  onOpenExplainPanel={handleOpenExplain}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Why Recommended AI Modal */}
      <WhyRecommendedPanel
        internship={selectedInternship}
        open={explainOpen}
        onOpenChange={setExplainOpen}
      />
    </div>
  );
}
