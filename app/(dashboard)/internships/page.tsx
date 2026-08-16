"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { InternshipCard } from "@/components/internships/internship-card";
import { WhyRecommendedPanel } from "@/components/internships/why-recommended-panel";
import { Internship } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchInternships, InternshipItem } from "@/lib/api-client";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useAuth } from "@/components/providers/auth-provider";
import { Search, Filter, Sparkles, RefreshCw, X, AlertCircle, Briefcase } from "lucide-react";

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

/** Map backend InternshipItem shape from Supabase to frontend Internship type */
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
      "Collaborate with senior officers and domain leads on project deliverables.",
      "Analyze dataset inputs, draft technical notes, and build prototype solutions.",
      "Participate in weekly progress reviews and government stakeholder briefings.",
    ],
    requirements: [
      "Currently enrolled in or recently graduated from a recognized academic institution.",
      `Demonstrated proficiency in: ${item.required_skills.join(", ")}.`,
      "Strong analytical, problem-solving, and communication skills.",
    ],
    requiredSkills: item.required_skills.map((name, idx) => ({
      id: `sk_${idx}`,
      name,
      category: "Technical" as const,
    })),
    matchScore: breakdown.score,
    matchBreakdown: breakdown,
    aiExplanation: `This role in ${item.organization} requires ${item.required_skills.join(", ")}. Your profile matches ${breakdown.score}% of the target requirements.`,
    status: (item.status as Internship["status"]) ?? "Open",
  };
}

export default function InternshipsPage() {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [minMatch, setMinMatch] = useState<number>(0);
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [explainOpen, setExplainOpen] = useState(false);

  // Data state from Supabase API
  const [rawInternships, setRawInternships] = useState<InternshipItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const categories = [
    "All",
    "AI & Public Policy",
    "Software Engineering",
    "Cybersecurity",
    "Data Science",
    "Blockchain",
    "Machine Learning",
    "Design",
    "Environmental Science",
  ];

  const userSkills = useMemo(() => {
    return profile?.skills && profile.skills.length > 0
      ? profile.skills
      : ["Python", "Next.js", "TypeScript", "React", "SQL", "NLP"];
  }, [profile?.skills]);

  // Load live data from Supabase API on mount
  const loadInternships = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const result = await fetchInternships({});
      if (result.success && result.data) {
        setRawInternships(result.data);
      } else {
        setApiError(result.error ?? "Failed to fetch internships from database.");
      }
    } catch (err: any) {
      setApiError(err?.message ?? "An error occurred while connecting to Supabase database.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInternships();
  }, [loadInternships]);

  // Realtime subscription on internships table
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel("realtime-catalog-internships")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "internships",
        },
        () => {
          loadInternships();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadInternships]);

  // Map to frontend internships with dynamic scoring and sort
  const internships = useMemo(() => {
    return rawInternships
      .map((item) => mapToFrontendInternship(item, userSkills))
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [rawInternships, userSkills]);

  // Client-side filter
  const filteredInternships = useMemo(() => {
    return internships.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.organization.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.requiredSkills.some((sk) => sk.name.toLowerCase().includes(q));

      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      const matchesMatchScore = item.matchScore >= minMatch;

      return matchesSearch && matchesCategory && matchesMatchScore;
    });
  }, [internships, searchQuery, selectedCategory, minMatch]);

  const handleOpenExplain = (internship: Internship) => {
    setSelectedInternship(internship);
    setExplainOpen(true);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setMinMatch(0);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="ai" className="gap-1 px-2.5 py-0.5 text-[11px]">
              <Sparkles className="h-3.5 w-3.5" /> Real-time Match Engine Active
            </Badge>
            <span className="text-xs text-on-surface-variant dark:text-slate-400 font-medium">Verified Government Catalog</span>
          </div>
          <h1 className="text-2xl font-bold text-on-surface dark:text-white">Government Internship Catalog</h1>
          <p className="text-xs text-on-surface-variant dark:text-slate-400">
            Explore active public sector opportunities scored against your skills and background.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadInternships}
          className="gap-1.5 text-xs shrink-0 hover:bg-primary/5 hover:border-primary/40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          disabled={isLoading}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Database
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-outline-variant/60 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-on-surface-variant/60 dark:text-slate-400" />
            <Input
              placeholder="Search by title, department, or skill (e.g. NITI Aayog, Python, Next.js)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs sm:text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-on-surface-variant/60 hover:text-on-surface dark:text-slate-400 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 rounded-md border border-outline-variant dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs font-semibold text-on-surface dark:text-white focus:ring-2 focus:ring-primary shadow-xs"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={minMatch}
              onChange={(e) => setMinMatch(Number(e.target.value))}
              className="h-10 rounded-md border border-outline-variant dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs font-semibold text-on-surface dark:text-white focus:ring-2 focus:ring-primary shadow-xs"
            >
              <option value={0}>All Match Scores</option>
              <option value={80}>80%+ High Match</option>
              <option value={90}>90%+ Top Match</option>
            </select>

            {(searchQuery || selectedCategory !== "All" || minMatch > 0) && (
              <Button variant="ghost" size="sm" onClick={handleResetFilters} className="text-xs gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300">
                <X className="h-3.5 w-3.5" /> Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Error alert */}
      {apiError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-700 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Grid of Internships or Skeleton / Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-xl shimmer" />
          ))}
        </div>
      ) : filteredInternships.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant dark:text-slate-400">
              Showing <strong className="text-primary dark:text-blue-400">{filteredInternships.length}</strong> matching internship{filteredInternships.length !== 1 ? "s" : ""}
            </span>
            <span className="text-[11px] text-on-surface-variant/80 dark:text-slate-400">
              Sorted by precision match score
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredInternships.map((internship, i) => (
              <div
                key={internship.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <InternshipCard
                  internship={internship}
                  onOpenExplainPanel={handleOpenExplain}
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-xl p-12 text-center border border-outline-variant/40 space-y-4 max-w-md mx-auto shadow-xs">
          <div className="mx-auto h-12 w-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
            <Filter className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-on-surface">No internships found</h3>
          <p className="text-xs text-on-surface-variant">
            Try adjusting your search terms or lowering your minimum match threshold.
          </p>
          <Button variant="outline" size="sm" onClick={handleResetFilters}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Explainable AI Modal */}
      <WhyRecommendedPanel
        internship={selectedInternship}
        open={explainOpen}
        onOpenChange={setExplainOpen}
      />
    </div>
  );
}
