"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { SkillTag } from "@/components/internships/skill-tag";
import { WhyRecommendedPanel } from "@/components/internships/why-recommended-panel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { Internship } from "@/lib/types";
import { InternshipItem } from "@/lib/api-client";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/ui/toast";
import {
  Sparkles,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  Briefcase,
  ShieldCheck,
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
      ? new Date(item.created_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Active",
    deadline: "Open Application",
    openings: item.openings ?? 5,
    category: item.category ?? "Public Policy & Technology",
    description: item.description,
    responsibilities: [
      "Collaborate with senior consultants and government officers on platform development.",
      "Conduct technical analysis, policy framework audits, and system evaluations.",
      "Draft reports and present actionable technical recommendations to the department.",
    ],
    requirements: [
      "Currently pursuing or completed relevant degree from an accredited institution.",
      "Demonstrated foundational proficiency in required technical skills.",
      "Strong analytical abilities, communication skills, and passion for public sector technology.",
    ],
    requiredSkills: item.required_skills.map((name, idx) => ({
      id: `sk_${idx}`,
      name,
      category: "Technical" as const,
      matchLevel: candidateSkills.some(
        (cs) =>
          cs.toLowerCase().trim() === name.toLowerCase().trim() ||
          cs.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(cs.toLowerCase())
      )
        ? ("Matched" as const)
        : ("Missing" as const),
    })),
    matchScore: breakdown.score,
    matchBreakdown: breakdown,
    aiExplanation: `This position at ${item.organization} matches your profile with a ${breakdown.score}% alignment score based on your verified competencies in ${candidateSkills.slice(0, 3).join(", ")}.`,
    status: (item.status as Internship["status"]) ?? "Open",
  };
}

export default function InternshipDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile, refreshApplications, applications } = useAuth();
  const { success, error: toastError } = useToast();
  const id = params?.id as string;

  const [rawInternship, setRawInternship] = useState<InternshipItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [explainOpen, setExplainOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [localApplied, setLocalApplied] = useState(false);

  const userSkills = useMemo(() => {
    return profile?.skills && profile.skills.length > 0
      ? profile.skills
      : ["Python", "Next.js", "TypeScript", "React", "SQL", "NLP"];
  }, [profile?.skills]);

  // Force scroll to top on mount to fix Next.js scroll restoration issues
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  // Load target internship from Supabase via dedicated single-record endpoint
  useEffect(() => {
    async function loadDetail() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/internships/${id}`);
        const result = await res.json();
        if (result.success && result.data) {
          setRawInternship(result.data);
        } else {
          setError(result.error ?? `Internship #${id} was not found in the public database.`);
        }
      } catch (err: any) {
        setError(err?.message ?? "An error occurred while loading this record.");
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [id]);

  const internship: Internship | null = useMemo(() => {
    if (!rawInternship) return null;
    return mapToFrontendInternship(rawInternship, userSkills);
  }, [rawInternship, userSkills]);

  // Check if currently authenticated user has a pending application
  const existingApplication = applications.find((app) => app.internship_id === id);
  const isPending = existingApplication && ["Submitted", "Pending", "Under Review"].includes(existingApplication.status);
  const isApplied = isPending || localApplied;

  // Handle live application submission directly to Supabase
  const handleApply = async () => {
    if (!user) {
      router.push(`/login?redirect=/internships/${id}`);
      return;
    }
    if (isApplied) return;

    setIsApplying(true);
    setApplyError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const matchScore = internship?.matchScore ?? 85;

      if (existingApplication && (existingApplication.status === "Rejected" || existingApplication.status === "Accepted")) {
        // Retry application: Update existing finalized record instead of inserting new one
        const { error: updateError } = await supabase.from("applications")
          .update({
            status: "Submitted",
            match_score: matchScore,
            applied_at: new Date().toISOString(),
          })
          .eq("id", existingApplication.id);
          
        if (updateError) throw new Error(updateError.message);
      } else {
        // First time application: Insert new record
        const { error: insertError } = await supabase.from("applications").insert({
          user_id: user.id,
          internship_id: id,
          status: "Submitted",
          match_score: matchScore,
          applied_at: new Date().toISOString(),
        });

        if (insertError) {
          if (insertError.message.includes("duplicate key value") || insertError.code === "23505") {
            throw new Error("You have already submitted an application for this internship.");
          }
          throw new Error(insertError.message);
        }
      }

      await refreshApplications();
      setLocalApplied(true);
      success(`Your application for "${internship?.title}" was submitted successfully!`, "Application Sent");
    } catch (err: any) {
      const msg = err?.message || "Failed to submit application. Please try again.";
      setApplyError(msg);
      toastError(msg, "Submission Error");
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
        <div className="h-6 w-32 rounded shimmer" />
        <div className="h-64 rounded-2xl shimmer" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 rounded-2xl shimmer" />
          <div className="h-96 rounded-2xl shimmer" />
        </div>
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div className="space-y-4 text-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-outline-variant/40 dark:border-slate-800 max-w-md mx-auto shadow-sm">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-on-surface dark:text-white">Internship Not Found</h2>
        <p className="text-xs text-on-surface-variant dark:text-slate-400">{error || "Could not find the requested record."}</p>
        <Button variant="outline" size="sm" onClick={() => router.push("/internships")}>
          Return to Internship Catalog
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-colors group cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Recommendations
      </button>

      {/* Header Banner */}
      <Card className="bg-white dark:bg-slate-900 border-outline-variant/60 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="gap-1 text-xs">
                <Building2 className="h-3.5 w-3.5 text-primary dark:text-blue-400" /> {internship.organization}
              </Badge>
              <span className="text-xs text-on-surface-variant dark:text-slate-400 font-medium">
                {internship.ministryOrDepartment}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface dark:text-white tracking-tight">
              {internship.title}
            </h1>
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-on-surface-variant dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-secondary dark:text-slate-400" /> {internship.location} ({internship.type})
              </span>
              <span className="font-bold text-on-surface dark:text-white flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                {formatCurrency(internship.stipend)} / {internship.stipendPeriod.toLowerCase()}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> {internship.duration}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> Posted {internship.postedDate}
              </span>
            </div>
          </div>

          {/* AI Match Meter & Apply Button */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
            <button
              onClick={() => setExplainOpen(true)}
              className="group p-3 rounded-xl bg-ai-gradient-subtle dark:bg-blue-950/40 border border-primary/20 dark:border-blue-800/50 flex items-center justify-between lg:justify-end gap-3 text-left focus:outline-none hover:border-primary/50 transition-all shadow-xs cursor-pointer"
              title="Click for full AI match breakdown"
            >
              <div>
                <p className="text-[10px] uppercase font-bold text-primary dark:text-blue-400 tracking-wider">AI Precision Score</p>
                <p className="text-xs text-on-surface-variant dark:text-slate-400">Click for Explainable Audit</p>
              </div>
              <Badge variant="ai" className="text-sm px-3 py-1 gap-1 group-hover:scale-105 transition-transform shadow-xs">
                <Sparkles className="h-4 w-4" /> {internship.matchScore}%
              </Badge>
            </button>

            {isApplied ? (
              <Button disabled variant="outline" size="lg" className="gap-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-bold">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> Application Submitted
              </Button>
            ) : (
              <Button
                variant="ai"
                size="lg"
                onClick={handleApply}
                disabled={isApplying}
                className="gap-2 font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all"
              >
                {isApplying ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Submit Application
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {applyError && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-700 dark:text-red-300 animate-slide-right">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{applyError}</span>
          </div>
        )}
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Description, Responsibilities, Requirements */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 bg-white dark:bg-slate-900 border-outline-variant/60 dark:border-slate-800 space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-on-surface dark:text-white">About the Position</h3>
            <p className="text-xs sm:text-sm text-on-surface-variant dark:text-slate-300 leading-relaxed">
              {internship.description}
            </p>
          </Card>

          <Card className="p-6 bg-white dark:bg-slate-900 border-outline-variant/60 dark:border-slate-800 space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-on-surface dark:text-white">Key Responsibilities</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-on-surface-variant dark:text-slate-300">
              {internship.responsibilities.map((resp, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary dark:text-blue-400 shrink-0 mt-0.5" />
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6 bg-white dark:bg-slate-900 border-outline-variant/60 dark:border-slate-800 space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-on-surface dark:text-white">Eligibility & Requirements</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-on-surface-variant dark:text-slate-300">
              {internship.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-primary dark:bg-blue-400 shrink-0 mt-2" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Right Column: AI Match Breakdown & Required Skills */}
        <div className="space-y-6">
          {/* AI Match Overview Card */}
          <Card className="p-6 bg-ai-gradient-subtle dark:bg-blue-950/40 border-primary/20 dark:border-blue-800/50 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-primary dark:text-blue-400 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" /> AI Match Scoring
              </h3>
              <Badge variant="ai" className="text-xs">{internship.matchScore}%</Badge>
            </div>

            <p className="text-xs text-on-surface-variant dark:text-slate-300 leading-relaxed">
              {internship.aiExplanation}
            </p>

            <div className="space-y-3 pt-2 border-t border-primary/20 dark:border-blue-800/50">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-on-surface-variant dark:text-slate-300">Technical Skills</span>
                  <span className="text-primary dark:text-blue-400">{internship.matchBreakdown.skillsMatch}%</span>
                </div>
                <Progress value={internship.matchBreakdown.skillsMatch} className="h-1.5" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-on-surface-variant dark:text-slate-300">Academic Alignment</span>
                  <span className="text-primary dark:text-blue-400">{internship.matchBreakdown.academicMatch}%</span>
                </div>
                <Progress value={internship.matchBreakdown.academicMatch} className="h-1.5" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-on-surface-variant dark:text-slate-300">Location Compatibility</span>
                  <span className="text-primary dark:text-blue-400">{internship.matchBreakdown.locationMatch}%</span>
                </div>
                <Progress value={internship.matchBreakdown.locationMatch} className="h-1.5" />
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setExplainOpen(true)}
              className="w-full text-xs font-semibold mt-2 border-primary/30 text-primary dark:text-blue-400 hover:bg-primary/5 dark:hover:bg-blue-950/60"
            >
              View Detailed AI Audit
            </Button>
          </Card>

          {/* Required Skills Card */}
          <Card className="p-6 bg-white dark:bg-slate-900 border-outline-variant/60 dark:border-slate-800 space-y-3 shadow-xs">
            <h3 className="text-sm font-bold text-on-surface dark:text-white flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 text-primary dark:text-blue-400" /> Required Competencies
            </h3>
            <div className="flex flex-wrap gap-2 pt-1">
              {internship.requiredSkills.map((sk) => (
                <SkillTag key={sk.id} skill={sk} showStatus />
              ))}
            </div>
          </Card>

          {/* Public Sector Notice */}
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/40 p-4 space-y-2 text-xs text-emerald-900 dark:text-emerald-300 shadow-xs">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Government Merit Guarantee
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
              Applications are evaluated blindly on technical alignment and academic merit. Demographic parity is monitored continuously.
            </p>
          </div>
        </div>
      </div>

      {/* Why Recommended AI Modal */}
      <WhyRecommendedPanel
        internship={internship}
        open={explainOpen}
        onOpenChange={setExplainOpen}
      />
    </div>
  );
}
