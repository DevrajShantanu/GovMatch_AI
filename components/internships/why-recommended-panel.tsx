"use client";

import { Internship } from "@/lib/types";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { SkillTag } from "./skill-tag";
import { formatCurrency } from "@/lib/utils";
import { Sparkles, Building2, MapPin, ThumbsUp, ThumbsDown, Bookmark } from "lucide-react";
import { useState } from "react";

interface WhyRecommendedPanelProps {
  internship: Internship | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFeedback?: (internshipId: string, feedbackType: "INTERESTED" | "NOT_INTERESTED" | "BOOKMARKED") => void;
}

export function WhyRecommendedPanel({
  internship,
  open,
  onOpenChange,
  onFeedback,
}: WhyRecommendedPanelProps) {
  const [userVote, setUserVote] = useState<"INTERESTED" | "NOT_INTERESTED" | "BOOKMARKED" | null>(null);

  if (!internship) return null;

  const handleVote = (type: "INTERESTED" | "NOT_INTERESTED" | "BOOKMARKED") => {
    setUserVote(type);
    onFeedback?.(internship.id, type);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
        {/* Header */}
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="ai" className="gap-1 px-2.5 py-0.5">
              <Sparkles className="h-3.5 w-3.5" /> {internship.matchScore}% Match Score
            </Badge>
            <span className="text-xs text-on-surface-variant dark:text-slate-400 font-medium">Explainable AI Breakdown</span>
          </div>
          <DialogTitle>{internship.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-4 text-xs mt-1">
            <span className="flex items-center gap-1 font-medium text-on-surface dark:text-slate-200">
              <Building2 className="h-3.5 w-3.5 text-primary dark:text-blue-400" /> {internship.organization}
            </span>
            <span className="flex items-center gap-1 text-on-surface-variant dark:text-slate-400">
              <MapPin className="h-3.5 w-3.5" /> {internship.location} ({internship.type})
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* AI Match Factors Breakdown */}
        <div className="rounded-xl bg-ai-gradient-subtle dark:bg-blue-950/40 border border-primary/20 dark:border-blue-800/50 p-4 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary dark:text-blue-400 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" /> Why GovMatch Recommended This
          </h4>
          <p className="text-sm text-on-surface dark:text-slate-100 leading-relaxed font-medium">
            &ldquo;{internship.aiExplanation}&rdquo;
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-white dark:bg-slate-900/90 rounded-xl p-3 border border-outline-variant/40 dark:border-slate-800 space-y-1.5">
              <div className="flex justify-between text-xs font-medium dark:text-slate-300">
                <span>Technical Skills Alignment</span>
                <span className="font-bold text-primary dark:text-blue-400">{internship.matchBreakdown.skillsMatch}%</span>
              </div>
              <Progress value={internship.matchBreakdown.skillsMatch} />
            </div>

            <div className="bg-white dark:bg-slate-900/90 rounded-xl p-3 border border-outline-variant/40 dark:border-slate-800 space-y-1.5">
              <div className="flex justify-between text-xs font-medium dark:text-slate-300">
                <span>Academic & Degree Match</span>
                <span className="font-bold text-primary dark:text-blue-400">{internship.matchBreakdown.academicMatch}%</span>
              </div>
              <Progress value={internship.matchBreakdown.academicMatch} />
            </div>

            <div className="bg-white dark:bg-slate-900/90 rounded-xl p-3 border border-outline-variant/40 dark:border-slate-800 space-y-1.5">
              <div className="flex justify-between text-xs font-medium dark:text-slate-300">
                <span>Location Preference</span>
                <span className="font-bold text-primary dark:text-blue-400">{internship.matchBreakdown.locationMatch}%</span>
              </div>
              <Progress value={internship.matchBreakdown.locationMatch} />
            </div>

            <div className="bg-white dark:bg-slate-900/90 rounded-xl p-3 border border-outline-variant/40 dark:border-slate-800 space-y-1.5">
              <div className="flex justify-between text-xs font-medium dark:text-slate-300">
                <span>Domain Interest Alignment</span>
                <span className="font-bold text-primary dark:text-blue-400">{internship.matchBreakdown.domainMatch}%</span>
              </div>
              <Progress value={internship.matchBreakdown.domainMatch} />
            </div>
          </div>
        </div>

        {/* Skills Matched & Gap */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider">Required Skills Audit</h4>
          <div className="flex flex-wrap gap-2">
            {internship.requiredSkills.map((sk) => (
              <SkillTag key={sk.id} skill={sk} showStatus />
            ))}
          </div>
        </div>

        {/* Interactive Feedback Buttons */}
        <div className="pt-4 border-t border-outline-variant/40 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs font-semibold text-on-surface-variant dark:text-slate-400 flex items-center gap-2">
            Is this recommendation relevant?
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant={userVote === "INTERESTED" ? "default" : "outline"}
              size="sm"
              onClick={() => handleVote("INTERESTED")}
              className="gap-1.5 flex-1 sm:flex-initial"
            >
              <ThumbsUp className="h-3.5 w-3.5" /> Interested
            </Button>
            <Button
              variant={userVote === "NOT_INTERESTED" ? "destructive" : "outline"}
              size="sm"
              onClick={() => handleVote("NOT_INTERESTED")}
              className="gap-1.5 flex-1 sm:flex-initial"
            >
              <ThumbsDown className="h-3.5 w-3.5" /> Not Relevant
            </Button>
            <Button
              variant={userVote === "BOOKMARKED" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleVote("BOOKMARKED")}
              className="gap-1"
            >
              <Bookmark className="h-3.5 w-3.5" /> Save
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
