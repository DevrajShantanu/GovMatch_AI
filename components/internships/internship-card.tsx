"use client";

import { Internship } from "@/lib/types";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { SkillTag } from "./skill-tag";
import { formatCurrency } from "@/lib/utils";
import { Sparkles, Building2, MapPin, Calendar, ArrowRight, Bookmark, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "../ui/toast";

interface InternshipCardProps {
  internship: Internship;
  onOpenExplainPanel?: (internship: Internship) => void;
  onBookmarkToggle?: (internshipId: string) => void;
}

export function InternshipCard({
  internship,
  onOpenExplainPanel,
  onBookmarkToggle,
}: InternshipCardProps) {
  const { applications } = useAuth();
  const { info } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`saved_${internship.id}`);
      if (saved === "true") setIsBookmarked(true);
    } catch {}
  }, [internship.id]);

  const isApplied = applications.some((app) => app.internship_id === internship.id);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    try {
      localStorage.setItem(`saved_${internship.id}`, nextState ? "true" : "false");
    } catch {}
    info(nextState ? `Saved "${internship.title}" to your bookmarks.` : `Removed from bookmarks.`);
    onBookmarkToggle?.(internship.id);
  };

  const getMatchBadgeStyle = (score: number) => {
    if (score >= 90) return "bg-emerald-600 text-white shadow-emerald-500/20";
    if (score >= 80) return "bg-primary dark:bg-blue-600 text-white shadow-primary/20";
    return "bg-slate-700 dark:bg-slate-800 text-white";
  };

  return (
    <Card className="ai-glass-card ai-glass-card-hover flex flex-col justify-between overflow-hidden border-outline-variant/60 dark:border-slate-800/80 shadow-xs hover:shadow-xl transition-all duration-300 group">
      <CardContent className="p-5 sm:p-6 space-y-4">
        {/* Header Badge & Title */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-primary dark:text-blue-400 flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" /> {internship.organization}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container dark:bg-slate-800 font-semibold text-on-surface-variant dark:text-slate-300">
                {internship.category}
              </span>
              {isApplied && (
                <Badge variant="success" className="gap-1 text-[10px] py-0 px-2">
                  <CheckCircle2 className="h-3 w-3" /> Applied
                </Badge>
              )}
            </div>
            <h3 className="text-base font-bold text-on-surface dark:text-white group-hover:text-primary dark:group-hover:text-blue-400 transition-colors line-clamp-1">
              <Link href={`/internships/${internship.id}`}>
                {internship.title}
              </Link>
            </h3>
          </div>

          {/* AI Match Score Badge */}
          <button
            onClick={() => onOpenExplainPanel?.(internship)}
            className="group/btn flex flex-col items-end focus:outline-none shrink-0"
            title="Click to view AI match explanation"
          >
            <Badge className={`gap-1 px-2.5 py-1 text-xs shadow-md transition-transform group-hover/btn:scale-105 ${getMatchBadgeStyle(internship.matchScore)}`}>
              <Sparkles className="h-3 w-3" /> {internship.matchScore}% Match
            </Badge>
            <span className="text-[10px] text-primary dark:text-blue-400 font-semibold underline underline-offset-2 mt-0.5">
              Why match?
            </span>
          </button>
        </div>

        {/* Location, Stipend, Duration Pills */}
        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs text-on-surface-variant dark:text-slate-400 pt-2 border-t border-outline-variant/30 dark:border-slate-800">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-secondary dark:text-slate-400" /> {internship.location} ({internship.type})
          </span>
          <span className="font-bold text-on-surface dark:text-slate-200">
            {formatCurrency(internship.stipend)} / {internship.stipendPeriod.toLowerCase()}
          </span>
          <span className="flex items-center gap-1 text-on-surface-variant/80 dark:text-slate-400">
            <Calendar className="h-3.5 w-3.5" /> {internship.duration}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-on-surface-variant dark:text-slate-300 leading-relaxed line-clamp-2">
          {internship.description}
        </p>

        {/* Skill Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {internship.requiredSkills.slice(0, 3).map((sk) => (
            <SkillTag key={sk.id} skill={sk} size="sm" />
          ))}
          {internship.requiredSkills.length > 3 && (
            <span className="text-[11px] text-on-surface-variant dark:text-slate-300 px-2 py-0.5 rounded-full bg-surface-container dark:bg-slate-800 font-medium">
              +{internship.requiredSkills.length - 3} more
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-3.5 px-5 bg-surface-container-lowest/70 dark:bg-slate-900/60 border-t border-outline-variant/30 dark:border-slate-800 flex items-center justify-between gap-3">
        <button
          onClick={handleBookmark}
          className={`p-2 rounded-lg transition-all ${
            isBookmarked
              ? "bg-primary-fixed dark:bg-blue-900/60 text-primary dark:text-blue-300 font-bold shadow-xs scale-105"
              : "text-on-surface-variant dark:text-slate-400 hover:bg-surface-container dark:hover:bg-slate-800 hover:text-on-surface dark:hover:text-white"
          }`}
          title={isBookmarked ? "Remove from bookmarks" : "Save internship"}
        >
          <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-primary dark:fill-blue-400" : ""}`} />
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenExplainPanel?.(internship)}
            className="text-xs text-primary dark:text-blue-400 font-semibold hover:bg-primary/10 dark:hover:bg-blue-950/40"
          >
            AI Insight
          </Button>
          <Link href={`/internships/${internship.id}`}>
            <Button size="sm" className="gap-1.5 text-xs font-bold shadow-xs hover:shadow-md">
              View Details <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
