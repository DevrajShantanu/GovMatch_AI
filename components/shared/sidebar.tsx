"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  TrendingUp,
  ShieldAlert,
  Settings,
  Bell,
  Sparkles,
  LogOut,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import { signOutAction } from "@/app/actions/auth";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { profile, user, applicationCount } = useAuth();
  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Student";
  const skillCount = profile?.skills?.length || 0;

  const baseNavigationItems: NavItem[] = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Recommendations", href: "/internships", icon: Briefcase },
    { name: "Resume Analysis", href: "/resume", icon: FileText },
    { name: "Skill Gap Matrix", href: "/skill-gap", icon: TrendingUp },
    {
      name: "Notifications",
      href: "/notifications",
      icon: Bell,
      badge: applicationCount > 0 ? `${applicationCount}` : undefined,
    },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const adminItem: NavItem = { name: "Admin & Bias Audit", href: "/admin", icon: ShieldAlert };

  const navigationItems: NavItem[] =
    profile?.role === "ADMIN"
      ? [...baseNavigationItems, adminItem]
      : baseNavigationItems;

  return (
    <aside
      className={cn(
        "flex flex-col w-64 border-r border-outline-variant/40 dark:border-slate-800/80 bg-white dark:bg-slate-950 min-h-[calc(100vh-4rem)] p-4 space-y-6 transition-colors",
        className
      )}
    >
      {/* User Profile Mini-Card */}
      <div className="rounded-xl p-3 bg-surface-container/60 dark:bg-slate-900/80 space-y-2 border border-outline-variant/40 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-primary-fixed dark:bg-blue-900/60 border border-primary/20 dark:border-blue-700/50 flex items-center justify-center shrink-0 shadow-xs">
            <span className="text-primary dark:text-blue-300 font-bold text-sm">{displayName[0]?.toUpperCase()}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-on-surface dark:text-white truncate">{displayName}</p>
            <p className="text-[10px] text-on-surface-variant dark:text-slate-400 font-medium">
              {skillCount} skill{skillCount !== 1 ? "s" : ""} • Verified
            </p>
          </div>
        </div>
      </div>

      {/* AI Recommendation Status Pill */}
      <div className="rounded-xl p-3.5 bg-ai-gradient-subtle dark:bg-blue-950/40 border border-primary/20 dark:border-blue-800/50 space-y-1.5 shadow-2xs">
        <div className="flex items-center gap-1.5 text-xs font-bold text-primary dark:text-blue-400">
          <Sparkles className="h-3.5 w-3.5 text-primary dark:text-blue-400" />
          <span>GovMatch AI Active</span>
        </div>
        <p className="text-[11px] text-on-surface-variant dark:text-slate-300 leading-relaxed">
          {skillCount > 0 ? (
            <>
              Your <strong className="text-primary dark:text-blue-400 font-semibold">{skillCount} skills</strong> are being matched with live postings in real time.
            </>
          ) : (
            <>
              Add skills in <strong className="text-primary dark:text-blue-400 font-semibold">Settings</strong> to get tailored AI recommendations.
            </>
          )}
        </p>
      </div>

      {/* Navigation List */}
      <div className="flex-1 space-y-1">
        <div className="px-3 text-[10px] font-bold text-on-surface-variant/70 dark:text-slate-400 uppercase tracking-wider mb-2">
          Navigation
        </div>
        {navigationItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group",
                isActive
                  ? "bg-primary dark:bg-blue-600 text-white shadow-sm shadow-primary/25 font-bold"
                  : "text-on-surface-variant dark:text-slate-300 hover:bg-surface-container dark:hover:bg-slate-900 hover:text-on-surface dark:hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "h-4 w-4 transition-transform group-hover:scale-110",
                    isActive ? "text-white" : "text-on-surface-variant dark:text-slate-400"
                  )}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-primary-fixed dark:bg-blue-900 text-primary dark:text-blue-300"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer / Sign out */}
      <div className="pt-4 border-t border-outline-variant/40 dark:border-slate-800">
        <form action={signOutAction}>
          <button
            type="submit"
            onClick={() => { try { sessionStorage.clear(); } catch {} }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
