"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { SkillComparisonView } from "@/components/skill-gap/skill-comparison-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { analyzeSkillGap } from "@/lib/api-client";
import { SkillGapAnalysis } from "@/lib/types";
import { Sparkles, RefreshCw, AlertCircle, GraduationCap } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";

// Role presets: title → required skills
const ROLE_PRESETS: Record<string, string[]> = {
  "AI Policy & Governance Lead Intern": [
    "Python",
    "Data Science",
    "Natural Language Processing",
    "Algorithmic Fairness Audit",
    "Public Policy Basics",
    "Data Privacy Regulation",
  ],
  "Full-Stack E-Governance Platform Intern": [
    "Next.js / React",
    "TypeScript",
    "SQL & PostgreSQL",
    "REST APIs",
    "CI/CD",
  ],
  "Data Science & Citizen Analytics Intern": [
    "Python",
    "Data Science & NLP",
    "Data Visualization",
    "Machine Learning",
    "SQL",
  ],
  "Cybersecurity Anomaly Specialist": [
    "Python",
    "Docker & Kubernetes",
    "Network Security",
    "Linux",
    "Machine Learning",
  ],
};

const DEFAULT_ROLE = "AI Policy & Governance Lead Intern";

const INITIAL_SKILL_GAP: SkillGapAnalysis = {
  targetRole: DEFAULT_ROLE,
  matchPercentage: 75,
  possessedSkills: [
    { id: "s1", name: "Python", category: "Technical", proficiency: "Advanced", matchLevel: "Matched" },
    { id: "s2", name: "Data Science", category: "Technical", proficiency: "Intermediate", matchLevel: "Matched" },
    { id: "s3", name: "Natural Language Processing", category: "Technical", proficiency: "Intermediate", matchLevel: "Matched" },
  ],
  gapSkills: [
    { id: "g1", name: "Algorithmic Fairness Audit", category: "Technical", proficiency: "Beginner", matchLevel: "Missing" },
    { id: "g2", name: "Public Policy Basics", category: "Domain", proficiency: "Beginner", matchLevel: "Missing" },
    { id: "g3", name: "Data Privacy Regulation", category: "Domain", proficiency: "Beginner", matchLevel: "Missing" },
  ],
  recommendedCourses: [
    {
      title: "Algorithmic Audit & AI Ethics in Public Sector",
      provider: "iGOT Karmayogi Portal",
      duration: "4 Weeks",
      level: "Intermediate",
      linkUrl: "https://igotkarmayogi.gov.in",
    },
    {
      title: "Digital Personal Data Protection (DPDP) Act Compliance",
      provider: "NPTEL / SWAYAM",
      duration: "6 Weeks",
      level: "Intermediate",
      linkUrl: "https://nptel.ac.in",
    },
  ],
};

export default function SkillGapPage() {
  const { profile } = useAuth();
  const [selectedRole, setSelectedRole] = useState(DEFAULT_ROLE);
  const [skillGapData, setSkillGapData] = useState<SkillGapAnalysis>(INITIAL_SKILL_GAP);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingAI, setUsingAI] = useState(false);

  // In-memory cache per role & request guard to prevent API quota exhaustion
  const analysisCacheRef = useRef<Record<string, SkillGapAnalysis>>({});
  const isRequestingRef = useRef(false);
  const hasInitializedAIRef = useRef(false);

  const userSkills = useMemo(() => {
    return profile?.skills && profile.skills.length > 0
      ? profile.skills
      : ["Python", "Next.js", "TypeScript", "React", "SQL", "NLP"];
  }, [profile?.skills]);

  const calculateLocalAnalysis = useCallback(
    (role: string, requiredSkills: string[]): SkillGapAnalysis => {
      const userLower = new Set(userSkills.map((s) => s.toLowerCase().trim()));
      const possessed = requiredSkills
        .filter(
          (s) =>
            userLower.has(s.toLowerCase().trim()) ||
            userSkills.some(
              (us) =>
                us.toLowerCase().includes(s.toLowerCase()) ||
                s.toLowerCase().includes(us.toLowerCase())
            )
        )
        .map((name, idx) => ({
          id: `pos_${idx}`,
          name,
          category: "Technical" as const,
          proficiency: "Intermediate" as const,
          matchLevel: "Matched" as const,
        }));

      const gap = requiredSkills
        .filter(
          (s) =>
            !userLower.has(s.toLowerCase().trim()) &&
            !userSkills.some(
              (us) =>
                us.toLowerCase().includes(s.toLowerCase()) ||
                s.toLowerCase().includes(us.toLowerCase())
            )
        )
        .map((name, idx) => ({
          id: `gap_${idx}`,
          name,
          category: "Technical" as const,
          proficiency: "Beginner" as const,
          matchLevel: "Missing" as const,
        }));

      const matchPct = Math.round(
        (possessed.length / Math.max(requiredSkills.length, 1)) * 100
      );

      return {
        targetRole: role,
        matchPercentage: Math.max(matchPct, 30),
        possessedSkills: possessed,
        gapSkills: gap,
        recommendedCourses: gap.map((sk, i) => ({
          title: `Mastering ${sk.name} for Public Sector Applications`,
          provider: i % 2 === 0 ? "iGOT Karmayogi Portal" : "NPTEL / SWAYAM",
          duration: "4 Weeks",
          level: "Intermediate",
          linkUrl: "https://igotkarmayogi.gov.in",
        })),
      };
    },
    [userSkills]
  );

  const runAnalysis = useCallback(
    async (role: string, forceRefresh = false) => {
      const requiredSkills = ROLE_PRESETS[role] ?? ROLE_PRESETS[DEFAULT_ROLE];

      const CACHE_KEY = `govmatch_skillgap_${role.replace(/\s+/g, '_')}`;

      // 1. Check local cache first unless user forced refresh
      if (!forceRefresh) {
        if (analysisCacheRef.current[role]) {
          setSkillGapData(analysisCacheRef.current[role]);
          setUsingAI(true);
          return;
        }
        try {
          const cached = sessionStorage.getItem(CACHE_KEY);
          if (cached) {
            const parsed = JSON.parse(cached);
            analysisCacheRef.current[role] = parsed;
            setSkillGapData(parsed);
            setUsingAI(true);
            return;
          }
        } catch {}
      }

      // If already in flight, don't spam duplicate calls
      if (isRequestingRef.current) return;

      isRequestingRef.current = true;
      setIsLoading(true);
      setError(null);
      setUsingAI(false);

      try {
        const result = await analyzeSkillGap({ userSkills, requiredSkills });
        if (result.success && result.data) {
          const { missing_skills, suggestions } = result.data;

          const userLower = new Set(userSkills.map((s) => s.toLowerCase().trim()));
          const possessed = requiredSkills
            .filter(
              (s) =>
                userLower.has(s.toLowerCase().trim()) ||
                userSkills.some(
                  (us) =>
                    us.toLowerCase().includes(s.toLowerCase()) ||
                    s.toLowerCase().includes(us.toLowerCase())
                )
            )
            .map((name, idx) => ({
              id: `pos_${idx}`,
              name,
              category: "Technical" as const,
              proficiency: "Intermediate" as const,
              matchLevel: "Matched" as const,
            }));

          const gap = (missing_skills ?? []).map((name, idx) => ({
            id: `gap_${idx}`,
            name,
            category: "Technical" as const,
            proficiency: "Beginner" as const,
            matchLevel: "Missing" as const,
          }));

          const matchPct = Math.round(
            (possessed.length / Math.max(requiredSkills.length, 1)) * 100
          );

          const analysisResult: SkillGapAnalysis = {
            targetRole: role,
            matchPercentage: Math.max(matchPct, 40),
            possessedSkills: possessed,
            gapSkills: gap,
            recommendedCourses: (suggestions ?? []).map((sugg, i) => ({
              title: sugg,
              provider: i % 2 === 0 ? "iGOT Karmayogi Portal" : "NPTEL / SWAYAM",
              duration: `${(i + 1) * 4} Weeks`,
              level: "Intermediate",
              linkUrl: "https://igotkarmayogi.gov.in",
            })),
          };

          analysisCacheRef.current[role] = analysisResult;
          try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(analysisResult)); } catch {}
          setSkillGapData(analysisResult);
          setUsingAI(true);
        } else {
          const local = calculateLocalAnalysis(role, requiredSkills);
          setSkillGapData(local);
        }
      } catch (err: any) {
        console.warn("Skill gap AI analysis failed, using local match:", err);
        const local = calculateLocalAnalysis(role, requiredSkills);
        setSkillGapData(local);
      } finally {
        setIsLoading(false);
        isRequestingRef.current = false;
      }
    },
    [userSkills, calculateLocalAnalysis]
  );

  // Initialize once on default role
  useEffect(() => {
    if (!hasInitializedAIRef.current) {
      hasInitializedAIRef.current = true;
      runAnalysis(DEFAULT_ROLE, false);
    }
  }, [runAnalysis]);

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    const requiredSkills = ROLE_PRESETS[role] ?? ROLE_PRESETS[DEFAULT_ROLE];

    // If cached, load it immediately with 0 latency
    if (analysisCacheRef.current[role]) {
      setSkillGapData(analysisCacheRef.current[role]);
      setUsingAI(true);
    } else {
      // Calculate instant local analysis first so UI never blocks
      const local = calculateLocalAnalysis(role, requiredSkills);
      setSkillGapData(local);
      setUsingAI(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-on-surface dark:text-white">
              AI Skill Gap Analyzer
            </h1>
            <Badge variant="ai" className="gap-1 px-2.5 py-0.5 text-[11px]">
              <Sparkles className="h-3.5 w-3.5" /> Live Competency Audit
            </Badge>
            <Badge variant="secondary" className="gap-1 text-[11px]">
              <GraduationCap className="h-3 w-3" /> {userSkills.length} Profile Skills Active
            </Badge>
          </div>
          <p className="text-xs text-on-surface-variant dark:text-slate-400 max-w-2xl">
            Compare your active profile skills against public sector job specifications. Missing competencies are automatically paired with certified bridge courses.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => runAnalysis(selectedRole, true)}
          disabled={isLoading}
          className="gap-2 shrink-0 border-outline-variant dark:border-slate-700 text-xs hover:bg-primary/5 hover:border-primary/40 dark:hover:bg-slate-800 dark:text-slate-200 shadow-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Analyzing..." : "Re-Analyze with AI"}
        </Button>
      </div>

      {/* Role Selection Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-xl bg-surface-container-high dark:bg-slate-900 border border-outline-variant/40 dark:border-slate-800 shadow-xs">
        {Object.keys(ROLE_PRESETS).map((role) => (
          <button
            key={role}
            onClick={() => handleRoleChange(role)}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
              selectedRole === role
                ? "bg-white dark:bg-slate-800 text-primary dark:text-blue-400 shadow-sm border border-outline-variant/60 dark:border-slate-700 scale-[1.02]"
                : "text-on-surface-variant dark:text-slate-400 hover:text-on-surface dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50"
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Status Alert */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 animate-slide-right">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {usingAI && !isLoading && (
        <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-ai-gradient-subtle p-3 text-xs text-primary font-medium shadow-xs animate-fade-in">
          <Sparkles className="h-4 w-4 shrink-0 text-primary" />
          <span>AI Roadmap generated via Gemini API with prioritized public sector courses.</span>
        </div>
      )}

      {/* Main Analysis View */}
      {isLoading ? (
        <div className="space-y-6">
          <div className="h-28 w-full rounded-2xl shimmer" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 w-full rounded-2xl shimmer" />
            <div className="h-64 w-full rounded-2xl shimmer" />
          </div>
        </div>
      ) : (
        <div className="animate-fade-in-up">
          <SkillComparisonView data={skillGapData} />
        </div>
      )}
    </div>
  );
}
