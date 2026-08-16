"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User as UserIcon,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  GraduationCap,
  MapPin,
  Code2,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";
import { deleteAccountAction } from "@/app/actions/auth";

export default function SettingsPage() {
  const { user, profile, loading: authLoading, refreshProfile, updateProfileLocally } = useAuth();
  const { theme, setTheme } = useTheme();
  const { success, error } = useToast();
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Account deletion state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    college: "",
    degree: "",
    graduation_year: "",
    location: "",
    bio: "",
    skills: "",
  });

  useEffect(() => {
    if (profile || user) {
      setFormData({
        name: profile?.full_name || user?.email?.split("@")[0] || "",
        email: profile?.email || user?.email || "",
        college: profile?.college || "",
        degree: profile?.degree || "",
        graduation_year: profile?.graduation_year ? profile.graduation_year.toString() : "",
        location: profile?.location || "",
        bio: profile?.bio || "",
        skills: profile?.skills?.join(", ") || "",
      });
    }
  }, [profile, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    const skillsArray = formData.skills
      ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const gradYearNum = formData.graduation_year ? parseInt(formData.graduation_year, 10) : undefined;

    // Optimistically update local profile state immediately
    updateProfileLocally({
      full_name: formData.name,
      college: formData.college,
      degree: formData.degree,
      graduation_year: gradYearNum,
      location: formData.location,
      bio: formData.bio,
      skills: skillsArray,
    });

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: formData.name,
          email: formData.email,
          college: formData.college,
          degree: formData.degree,
          graduation_year: gradYearNum ?? null,
          location: formData.location,
          bio: formData.bio,
          skills: skillsArray,
          updated_at: new Date().toISOString(),
        });

      if (upsertError) throw new Error(upsertError.message);

      await refreshProfile();
      setSaved(true);
      success("Profile and matching preferences saved successfully!", "Profile Updated");
      setTimeout(() => setSaved(false), 3500);
    } catch (err: any) {
      const message = err?.message || "Failed to update profile.";
      setErrorMsg(message);
      error(message, "Save Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    const { error: deleteError } = await deleteAccountAction();
    
    if (deleteError) {
      error("Failed to delete account. Please try again.", "Error");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    } else {
      window.location.href = "/login";
    }
  };

  if (authLoading) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
        <p className="text-xs text-on-surface-variant dark:text-slate-400 font-medium">Loading your profile configuration...</p>
      </div>
    );
  }

  const skillList = formData.skills
    ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="space-y-8 max-w-4xl animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-on-surface dark:text-white">Account & AI Matching Settings</h1>
            <Badge variant="ai" className="gap-1 px-2.5 py-0.5 text-[11px]">
              <Sparkles className="h-3 w-3" /> Live Sync Active
            </Badge>
          </div>
          <p className="text-xs text-on-surface-variant dark:text-slate-400">
            Update your profile, degree, and competencies. Changes automatically re-calculate your AI recommendation scores in real time without refreshing.
          </p>
        </div>
      </div>

      {/* Theme Selection Card */}
      <Card className="bg-white dark:bg-slate-900 border-outline-variant/60 dark:border-slate-800 shadow-md p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-on-surface dark:text-white flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-500 dark:hidden" />
              <Moon className="h-4 w-4 text-sky-400 hidden dark:inline" />
              Interface Theme & Aesthetics
            </h3>
            <p className="text-xs text-on-surface-variant dark:text-slate-400">
              Customize your viewing experience with clean Light mode or ultra-sleek Dark obsidian mode.
            </p>
          </div>

          <div className="flex items-center gap-2 p-1 bg-surface-container dark:bg-slate-800 rounded-xl border border-outline-variant/40 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                theme === "light"
                  ? "bg-white text-primary shadow-xs"
                  : "text-on-surface-variant dark:text-slate-400 hover:text-on-surface"
              }`}
            >
              <Sun className="h-3.5 w-3.5 text-amber-500" /> Light
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                theme === "dark"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-on-surface-variant dark:text-slate-400 hover:text-white"
              }`}
            >
              <Moon className="h-3.5 w-3.5 text-sky-300" /> Dark
            </button>
          </div>
        </div>
      </Card>

      <Card className="bg-white dark:bg-slate-900 border-outline-variant/60 dark:border-slate-800 shadow-md">
        <form onSubmit={handleSave}>
          <CardHeader className="border-b border-outline-variant/30 dark:border-slate-800 pb-6">
            <div className="flex items-center gap-4">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={formData.name}
                  className="h-16 w-16 rounded-full border-2 border-primary/40 dark:border-blue-500/50 object-cover shadow-sm"
                />
              ) : (
                <div className="h-16 w-16 rounded-full border-2 border-primary/30 dark:border-blue-500/30 bg-primary-fixed dark:bg-blue-950 flex items-center justify-center shadow-sm">
                  <UserIcon className="h-8 w-8 text-primary dark:text-blue-400" />
                </div>
              )}
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold text-on-surface dark:text-white">
                  {formData.name || "Student Profile"}
                </CardTitle>
                <p className="text-xs text-on-surface-variant dark:text-slate-400">{formData.email}</p>
                <div className="flex items-center gap-2 pt-0.5">
                  <Badge variant="secondary" className="text-[10px]">
                    Role: {profile?.role || "STUDENT"}
                  </Badge>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Active Profile
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 p-3.5 text-xs text-red-700 dark:text-red-300 animate-slide-right">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* General Info Grid */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-slate-400 flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-primary dark:text-blue-400" /> Academic & Personal Background
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-on-surface-variant dark:text-slate-400">Full Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Shantanu Sarkar"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-on-surface-variant dark:text-slate-400">Email Address</label>
                  <Input
                    value={formData.email}
                    disabled
                    className="bg-surface-container-low dark:bg-slate-800 text-on-surface-variant dark:text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-on-surface-variant dark:text-slate-400">Institution / College</label>
                  <Input
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    placeholder="e.g. IIT Delhi, NIT Trichy, Delhi University"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-on-surface-variant dark:text-slate-400">Degree & Major</label>
                  <Input
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    placeholder="e.g. B.Tech Computer Science, M.Sc Data Science"
                  />
                </div>
              </div>
            </div>

            {/* Location & Year */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-slate-400 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary dark:text-blue-400" /> Location & Graduation
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-on-surface-variant dark:text-slate-400">Preferred Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. New Delhi, Bengaluru, Hyderabad, Remote"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-on-surface-variant dark:text-slate-400">Graduation Year</label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background dark:bg-slate-950 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium text-on-surface dark:text-white"
                    value={formData.graduation_year}
                    onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
                  >
                    <option value="">Select graduation year...</option>
                    {[2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                      <option key={y} value={y.toString()}>
                        {y} {y >= new Date().getFullYear() ? "(Pursuing / Expected)" : "(Graduated)"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-slate-400 flex items-center gap-1.5">
                  <Code2 className="h-3.5 w-3.5 text-primary dark:text-blue-400" /> Technical & Policy Skills
                </h3>
                <span className="text-[11px] text-primary dark:text-blue-400 font-semibold">
                  {skillList.length} skill{skillList.length !== 1 ? "s" : ""} added
                </span>
              </div>

              <Input
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="e.g. Python, Next.js, TypeScript, SQL, Natural Language Processing, Machine Learning"
              />

              {skillList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {skillList.map((skill, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-3 py-1 rounded-full bg-primary-fixed dark:bg-blue-950 text-primary dark:text-blue-300 font-semibold border border-primary/20 dark:border-blue-700/50 shadow-xs animate-scale-in"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-[11px] text-on-surface-variant/80 dark:text-slate-400">
                Separate skills with commas. These skills are automatically matched with government internship requirements in real-time.
              </p>
            </div>

            {/* Bio */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold uppercase text-on-surface-variant dark:text-slate-400">Bio / Career Objectives</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Describe your domain interests (e.g. AI Policy, E-Governance, Cyber Security), projects, and career goals..."
                rows={3}
                className="w-full rounded-md border border-input bg-background dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none font-normal text-on-surface dark:text-white"
              />
            </div>
          </CardContent>

          <CardFooter className="justify-between border-t border-outline-variant/30 dark:border-slate-800 pt-5 pb-6 bg-surface-container-lowest/50 dark:bg-slate-900/50 rounded-b-xl">
            {saved ? (
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 animate-fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Changes live and synced across portal!
              </span>
            ) : (
              <span className="text-[11px] text-on-surface-variant/70 dark:text-slate-400">
                All changes sync automatically to AI recommendation engine.
              </span>
            )}
            <Button type="submit" variant="ai" className="gap-2 font-bold shadow-md" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Profile Changes
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Danger Zone */}
      <Card className="mt-8 border-red-200 dark:border-red-900/50 shadow-sm bg-red-50/30 dark:bg-red-950/10">
        <CardHeader className="pb-3 border-b border-red-100 dark:border-red-900/30">
          <CardTitle className="text-sm font-black uppercase tracking-wider text-red-600 dark:text-red-500 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <h4 className="text-sm font-bold text-on-surface dark:text-slate-200">Delete Account Permanently</h4>
              <p className="text-xs text-on-surface-variant dark:text-slate-400 leading-relaxed">
                Once you delete your account, there is no going back. Please be certain. This will immediately destroy your profile, AI recommendations, application history, and authentication credentials.
              </p>
            </div>
            
            {!showDeleteConfirm ? (
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteConfirm(true)}
                className="border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold whitespace-nowrap"
              >
                Delete Account
              </Button>
            ) : (
              <div className="flex flex-col items-end gap-3 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-900/50 w-full sm:w-auto animate-in fade-in zoom-in-95 duration-200">
                <span className="text-xs font-bold text-red-600 dark:text-red-400 text-right">
                  Are you absolutely sure?
                </span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="h-8 text-xs font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="h-8 text-xs font-bold bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? "Deleting..." : "Yes, Delete Everything"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
