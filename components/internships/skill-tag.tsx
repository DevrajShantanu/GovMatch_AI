import { Skill } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface SkillTagProps {
  skill: Skill;
  showStatus?: boolean;
  size?: "sm" | "md";
}

export function SkillTag({ skill, showStatus = false, size = "md" }: SkillTagProps) {
  const isMatched = skill.matchLevel === "Matched";
  const isMissing = skill.matchLevel === "Missing";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg font-semibold transition-all shadow-2xs",
        size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
        showStatus
          ? isMatched
            ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
            : isMissing
            ? "bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60"
            : "bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
          : "bg-surface-container-high dark:bg-slate-800 text-on-surface-variant dark:text-slate-200 border border-outline-variant/40 dark:border-slate-700 hover:bg-surface-container-highest dark:hover:bg-slate-700/80"
      )}
    >
      {showStatus && isMatched && <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />}
      {showStatus && isMissing && <AlertCircle className="h-3 w-3 text-rose-600 dark:text-rose-400" />}
      <span>{skill.name}</span>
      {skill.proficiency && (
        <span className="text-[10px] opacity-75">({skill.proficiency})</span>
      )}
    </span>
  );
}
