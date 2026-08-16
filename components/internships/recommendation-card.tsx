"use client";

import { Recommendation } from "@/lib/types";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { formatCurrency } from "@/lib/utils";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface RecommendationCardProps {
  recommendation: Recommendation;
  onOpenExplainPanel?: (recommendation: Recommendation) => void;
}

export function RecommendationCard({
  recommendation,
  onOpenExplainPanel,
}: RecommendationCardProps) {
  const { internship, matchScore, reasons } = recommendation;

  return (
    <Card className="relative overflow-hidden border-2 border-primary/40 dark:border-blue-500/50 bg-gradient-to-r from-white via-white to-primary-fixed/20 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/40 shadow-xl hover:shadow-2xl transition-all group">
      {/* Light Sweep Animation */}
      <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 dark:via-blue-400/10 to-transparent pointer-events-none animate-sweep" />
      <div className="absolute top-0 right-0 w-40 h-40 bg-ai-gradient opacity-15 dark:opacity-25 rounded-bl-full pointer-events-none" />
      
      <CardContent className="p-6 space-y-4 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="ai" className="gap-1.5 px-3 py-1 text-xs shadow-md">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </div>
                <Sparkles className="h-3.5 w-3.5" /> Top AI Recommendation ({matchScore}%)
              </Badge>
              <span className="text-xs text-secondary dark:text-blue-300 font-bold">{internship.organization}</span>
            </div>
            <h3 className="text-lg font-extrabold text-on-surface dark:text-white">
              <Link href={`/internships/${internship.id}`} className="hover:text-primary dark:hover:text-blue-400 transition-colors">
                {internship.title}
              </Link>
            </h3>
          </div>

          <Button
            variant="ai"
            size="sm"
            onClick={() => onOpenExplainPanel?.(recommendation)}
            className="gap-1 text-xs self-start sm:self-auto font-bold shadow-md cursor-pointer"
          >
            Why This Recommendation?
          </Button>
        </div>

        {/* Highlight Reasons */}
        <div className="rounded-xl bg-surface-container-low dark:bg-slate-800/80 p-4 space-y-2 border border-outline-variant/30 dark:border-slate-700/80">
          <div className="text-[11px] font-bold uppercase tracking-wider text-primary dark:text-blue-400 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Key Match Factors:
          </div>
          <ul className="space-y-1.5 text-xs text-on-surface dark:text-slate-200">
            {reasons.map((reason, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-medium">{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-outline-variant/30 dark:border-slate-800">
          <div className="flex flex-wrap gap-3 text-xs text-on-surface-variant dark:text-slate-300 font-medium">
            <span className="font-bold text-on-surface dark:text-white">{formatCurrency(internship.stipend)} / mo</span>
            <span>{internship.location} ({internship.type})</span>
            <span>Duration: {internship.duration}</span>
          </div>

          <Link href={`/internships/${internship.id}`}>
            <Button size="sm" className="gap-1.5 text-xs font-bold shadow-sm hover:shadow-md cursor-pointer">
              Apply Now <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
