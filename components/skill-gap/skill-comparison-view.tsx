"use client";

import { SkillGapAnalysis } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { SkillTag } from "../internships/skill-tag";
import { Sparkles, CheckCircle2, AlertTriangle, BookOpen, ExternalLink } from "lucide-react";

interface SkillComparisonViewProps {
  data: SkillGapAnalysis;
}

export function SkillComparisonView({ data }: SkillComparisonViewProps) {
  return (
    <div className="space-y-6">
      {/* Target Role Score Header */}
      <Card className="bg-ai-gradient-subtle dark:bg-blue-950/40 border-primary/20 dark:border-blue-800/50 p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="ai" className="gap-1">
                <Sparkles className="h-3.5 w-3.5" /> Target Position Matrix
              </Badge>
              <span className="text-xs text-on-surface-variant dark:text-slate-400 font-medium">Real-time Readiness Score</span>
            </div>
            <h2 className="text-xl font-bold text-on-surface dark:text-white">{data.targetRole}</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-2xl font-black text-primary dark:text-blue-400">{data.matchPercentage}%</span>
              <p className="text-[10px] text-on-surface-variant dark:text-slate-400 uppercase font-semibold">Skill Readiness</p>
            </div>
          </div>
        </div>

        {/* Progress bar for overall readiness */}
        <div className="pt-2 border-t border-outline-variant/30 dark:border-slate-800">
          <Progress value={data.matchPercentage} className="h-2" />
        </div>
      </Card>

      {/* Grid: Matched Skills vs Skill Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Possessed & Matched Skills */}
        <Card className="border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-slate-900 shadow-xs">
          <CardHeader className="p-4 border-b border-emerald-100 dark:border-emerald-950/60 flex flex-row items-center justify-between">
            <CardTitle className="text-base text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> Possessed Skills ({data.possessedSkills.length})
            </CardTitle>
            <Badge variant="success">Fully Verified</Badge>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <p className="text-xs text-on-surface-variant dark:text-slate-400">
              Skills extracted from your resume that directly align with government project requirements:
            </p>
            {data.possessedSkills.length === 0 ? (
              <p className="text-xs text-on-surface-variant dark:text-slate-500 italic">No matching skills detected for this role.</p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {data.possessedSkills.map((sk) => (
                  <SkillTag key={sk.id} skill={sk} showStatus />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Missing / Gap Skills */}
        <Card className="border-amber-200 dark:border-amber-900/60 bg-white dark:bg-slate-900 shadow-xs">
          <CardHeader className="p-4 border-b border-amber-100 dark:border-amber-950/60 flex flex-row items-center justify-between">
            <CardTitle className="text-base text-amber-900 dark:text-amber-300 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" /> Detected Skill Gaps ({data.gapSkills.length})
            </CardTitle>
            <Badge variant="warning">Recommended for Bridge</Badge>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <p className="text-xs text-on-surface-variant dark:text-slate-400">
              Critical competencies required by top postings that are missing or require strengthening:
            </p>
            {data.gapSkills.length === 0 ? (
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">🎉 No skill gaps detected! You meet all requirements for this role.</p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {data.gapSkills.map((sk) => (
                  <SkillTag key={sk.id} skill={sk} showStatus />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Recommended Skill Upskilling Roadmap */}
      {data.recommendedCourses.length > 0 && (
        <Card className="p-6 space-y-4 bg-white dark:bg-slate-900 border-outline-variant/60 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-on-surface dark:text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary dark:text-blue-400" /> AI Recommended Upskilling Roadmap
            </h3>
            <span className="text-xs text-on-surface-variant dark:text-slate-400 font-medium">Free Certified Portals</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.recommendedCourses.map((course, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-outline-variant/50 dark:border-slate-800 bg-surface-container-lowest/70 dark:bg-slate-800/60 hover:border-primary/40 dark:hover:border-blue-500/40 hover:shadow-md transition-all space-y-2 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-on-surface dark:text-white group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">
                    {course.title}
                  </h4>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {course.duration}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-on-surface-variant dark:text-slate-400 pt-1">
                  <span className="font-semibold text-primary dark:text-blue-400">{course.provider}</span>
                  <a
                    href={course.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-on-surface dark:text-slate-200 hover:text-primary dark:hover:text-blue-400"
                  >
                    Start Free <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
