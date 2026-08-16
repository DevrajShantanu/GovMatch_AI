"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Sparkles, Bell, Shield, Menu, X, LogOut, Settings, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ThemeToggle } from "../ui/theme-toggle";
import { useAuth } from "@/components/providers/auth-provider";
import { signOutAction } from "@/app/actions/auth";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, profile, loading } = useAuth();

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User";
  const avatarUrl = profile?.avatar_url;
  const userRole = profile?.role || "STUDENT";

  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!user) {
      setHasUnread(false);
      return;
    }
    
    const checkUnread = () => {
      const hidden = JSON.parse(localStorage.getItem("govmatch_hidden_notifs") || "[]");
      if (!hidden.includes("welcome_1")) {
        setHasUnread(true);
      } else {
        setHasUnread(false);
      }
    };

    checkUnread();

    // Listen for custom event when notifications are updated/deleted
    window.addEventListener("govmatch_notifications_updated", checkUnread);
    
    return () => {
      window.removeEventListener("govmatch_notifications_updated", checkUnread);
    };
  }, [user, pathname]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-outline-variant/40 bg-white/90 dark:bg-slate-950/85 dark:border-slate-800/80 backdrop-blur-xl transition-colors shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 dark:bg-blue-500/20 blur-md rounded-full group-hover:bg-primary/40 dark:group-hover:bg-blue-500/40 transition-colors duration-500" />
              <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-[0.85rem] bg-white dark:bg-slate-900 shadow-xl shadow-primary/30 dark:shadow-blue-500/30 group-hover:scale-110 group-hover:-translate-y-0.5 group-hover:shadow-primary/40 transition-all duration-500 overflow-hidden border border-white dark:border-slate-800">
                <Image 
                  src="/logo.png" 
                  alt="GovMatch AI Logo" 
                  fill
                  sizes="44px"
                  priority={true}
                  loading="eager"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors duration-300">
                GovMatch <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary-fixed dark:bg-blue-900/60 text-primary dark:text-blue-300 font-bold border border-primary/20 dark:border-blue-700/50">AI</span>
              </span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest group-hover:text-primary/70 transition-colors">
                National Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        {!isAuthPage && (
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {[
              { name: "Dashboard", href: "/dashboard" },
              { name: "Internships & AI Matches", href: "/internships" },
              { name: "Resume Scanner", href: "/resume" },
              { name: "Skill Gap Matrix", href: "/skill-gap" },
            ].map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-primary-fixed dark:bg-blue-950/80 text-primary dark:text-blue-300 font-bold border border-primary/20 dark:border-blue-700/60 shadow-xs"
                      : "text-on-surface-variant dark:text-slate-300 hover:text-on-surface dark:hover:text-white hover:bg-surface-container dark:hover:bg-slate-800/60"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}

            {userRole === "ADMIN" && (
              <Link
                href="/admin"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  pathname === "/admin"
                    ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-700"
                    : "text-on-surface-variant dark:text-slate-300 hover:text-on-surface dark:hover:text-white hover:bg-surface-container dark:hover:bg-slate-800/60"
                }`}
              >
                <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Admin & Bias Audit
              </Link>
            )}
          </nav>
        )}

        {/* User Quick Actions & Theme Toggle */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {loading ? (
            <div className="h-8 w-24 rounded-full shimmer" />
          ) : user ? (
            /* Authenticated state */
            <div className="flex items-center gap-2">
              <Link href="/notifications">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-on-surface-variant dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 hover:bg-primary/5 dark:hover:bg-slate-800 rounded-full h-9 w-9"
                  title="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {hasUnread && (
                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary dark:bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary dark:bg-blue-400"></span>
                    </span>
                  )}
                </Button>
              </Link>

              {/* User Avatar + Dropdown Button */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full hover:bg-surface-container dark:hover:bg-slate-800 transition-colors border border-outline-variant/50 dark:border-slate-700"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="h-7 w-7 rounded-full border border-primary/30 object-cover"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-primary-fixed dark:bg-blue-900 flex items-center justify-center text-primary dark:text-blue-300 font-bold text-xs">
                      {displayName[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="hidden lg:inline text-xs font-bold text-on-surface dark:text-slate-200 max-w-[100px] truncate">
                    {displayName}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-on-surface-variant dark:text-slate-400 hidden lg:inline" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 p-2 shadow-2xl border border-outline-variant/60 dark:border-slate-800 z-50 animate-scale-in space-y-1">
                      <div className="px-3 py-2 border-b border-outline-variant/30 dark:border-slate-800">
                        <p className="text-xs font-bold text-on-surface dark:text-white truncate">{displayName}</p>
                        <p className="text-[11px] text-on-surface-variant dark:text-slate-400 truncate">{user.email}</p>
                        <Badge variant="secondary" className="mt-1 text-[10px]">
                          {userRole}
                        </Badge>
                      </div>

                      <Link
                        href="/settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-on-surface dark:text-slate-200 hover:bg-surface-container dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Settings className="h-4 w-4 text-on-surface-variant dark:text-slate-400" /> Account Settings
                      </Link>

                      <Link
                        href="/notifications"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-on-surface dark:text-slate-200 hover:bg-surface-container dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Bell className="h-4 w-4 text-on-surface-variant dark:text-slate-400" /> Notifications
                      </Link>

                      <div className="pt-1 border-t border-outline-variant/30 dark:border-slate-800">
                        <form action={signOutAction}>
                          <button
                            type="submit"
                            onClick={() => { try { sessionStorage.clear(); } catch {} }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          >
                            <LogOut className="h-4 w-4" /> Sign Out
                          </button>
                        </form>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* Unauthenticated state */
            <div className="hidden sm:flex items-center gap-2.5">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-semibold text-xs dark:text-slate-200">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="ai" size="sm" className="font-bold text-xs shadow-md">
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-2 text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-high dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-outline-variant/40 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-2 animate-fade-in">
          {[
            { name: "Student Dashboard", href: "/dashboard" },
            { name: "Internship Recommendations", href: "/internships" },
            { name: "Resume Upload & Parser", href: "/resume" },
            { name: "Skill Gap Analyzer", href: "/skill-gap" },
            { name: "Account Settings", href: "/settings" },
            { name: "Notifications", href: "/notifications" },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 text-sm font-semibold rounded-lg ${
                pathname === item.href
                  ? "bg-primary-fixed dark:bg-blue-950 text-primary dark:text-blue-300"
                  : "text-on-surface dark:text-slate-200 hover:bg-surface-container-low dark:hover:bg-slate-800"
              }`}
            >
              {item.name}
            </Link>
          ))}

          {userRole === "ADMIN" && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg"
            >
              Admin Analytics & Bias Panel
            </Link>
          )}

          <div className="pt-2 border-t border-outline-variant/40 dark:border-slate-800">
            {user ? (
              <form action={signOutAction}>
                <Button
                  type="submit"
                  variant="outline"
                  onClick={() => { try { sessionStorage.clear(); } catch {} }}
                  className="w-full gap-2 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </form>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full text-xs">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ai" className="w-full text-xs">
                    Create Free Profile
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
