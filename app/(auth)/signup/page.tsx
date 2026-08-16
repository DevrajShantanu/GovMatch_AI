"use client";

import Link from "next/link";
import { useState, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Mail,
  Lock,
  Chrome,
  Building2,
  GraduationCap,
  Calendar,
  Code2,
} from "lucide-react";
import { signUpAction, signInWithGoogleAction } from "@/app/actions/auth";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    college: "",
    degree: "",
    graduation_year: "",
    skills: "",
  });

  const [state, formAction, isPending] = useActionState(signUpAction, {});

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setGoogleError(null);
    try {
      const result = await signInWithGoogleAction();
      if (result.url) {
        window.location.href = result.url;
      } else {
        setGoogleError(result.error || "Google sign-in failed. Please try again.");
        setGoogleLoading(false);
      }
    } catch (e: any) {
      setGoogleError(e?.message || "Google sign-in encountered an error.");
      setGoogleLoading(false);
    }
  };

  // Show success state after registration
  if (state?.success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-surface-container-low dark:bg-slate-950 transition-colors">
        <Card className="w-full max-w-md bg-white dark:bg-slate-900 border-outline-variant/60 dark:border-slate-800 shadow-xl">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/80">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-on-surface dark:text-white">Check Your Inbox!</h2>
            <p className="text-sm text-on-surface-variant dark:text-slate-300 leading-relaxed">
              {state.message}
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-bold text-primary dark:text-blue-400 hover:underline"
            >
              Go to Sign In <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-surface-container-low dark:bg-slate-950 transition-colors">
      <Card className="w-full max-w-lg bg-white dark:bg-slate-900 border-outline-variant/60 dark:border-slate-800 shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-ai-gradient text-white shadow-md">
            <Sparkles className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-on-surface dark:text-white">
            Create Your AI Profile
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-on-surface-variant dark:text-slate-400">
            Step {step} of 2:{" "}
            {step === 1 ? "Personal & Account Info" : "Academic & Skills"}
          </CardDescription>

          {/* Step indicator */}
          <div className="flex justify-center gap-2 pt-1">
            <div
              className={`h-1.5 w-12 rounded-full transition-all ${
                step >= 1 ? "bg-primary dark:bg-blue-500" : "bg-outline-variant/40 dark:bg-slate-800"
              }`}
            />
            <div
              className={`h-1.5 w-12 rounded-full transition-all ${
                step >= 2 ? "bg-primary dark:bg-blue-500" : "bg-outline-variant/40 dark:bg-slate-800"
              }`}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error alerts */}
          {state?.error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-700 dark:text-red-300 animate-slide-right">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}
          {googleError && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 p-3 text-xs text-amber-800 dark:text-amber-300 animate-slide-right">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{googleError}</span>
            </div>
          )}

          {step === 1 && (
            <>
              {/* Google OAuth shortcut */}
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2 font-semibold text-xs"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || isPending}
              >
                {googleLoading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Chrome className="h-4 w-4" />
                )}
                Sign Up with Google
              </Button>

              <div className="flex items-center gap-3 text-xs text-on-surface-variant dark:text-slate-400">
                <div className="flex-1 h-px bg-outline-variant/40 dark:bg-slate-800" />
                or enter details manually
                <div className="flex-1 h-px bg-outline-variant/40 dark:bg-slate-800" />
              </div>
            </>
          )}

          <form action={formAction} className="space-y-4">
            {step === 1 ? (
              /* Step 1: Personal Info */
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-slate-400">
                    Full Name *
                  </label>
                  <Input
                    name="full_name"
                    id="signup-name"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    placeholder="e.g. Shantanu Sarkar"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-slate-400">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-on-surface-variant/60 dark:text-slate-400" />
                    <Input
                      type="email"
                      name="email"
                      id="signup-email"
                      className="pl-9"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-slate-400">
                    Password * (min. 8 characters)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-on-surface-variant/60 dark:text-slate-400" />
                    <Input
                      type="password"
                      name="password"
                      id="signup-password"
                      className="pl-9"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="••••••••"
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ai"
                  className="w-full gap-2 mt-4 font-bold shadow-md"
                  onClick={() => {
                    if (formData.full_name && formData.email && formData.password.length >= 8) {
                      setStep(2);
                    }
                  }}
                  disabled={
                    !formData.full_name ||
                    !formData.email ||
                    formData.password.length < 8
                  }
                >
                  Continue to Academic Profile <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              /* Step 2: Academic & Skills */
              <div className="space-y-3">
                {/* Hidden fields to pass step 1 values to server action */}
                <input type="hidden" name="full_name" value={formData.full_name} />
                <input type="hidden" name="email" value={formData.email} />
                <input type="hidden" name="password" value={formData.password} />

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-slate-400 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-primary dark:text-blue-400" /> Institution / University
                  </label>
                  <Input
                    name="college"
                    id="signup-college"
                    value={formData.college}
                    onChange={(e) =>
                      setFormData({ ...formData, college: e.target.value })
                    }
                    placeholder="e.g. IIT Delhi, NIT Trichy, Delhi University"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-slate-400 flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-primary dark:text-blue-400" /> Degree & Major
                    </label>
                    <Input
                      name="degree"
                      id="signup-degree"
                      value={formData.degree}
                      onChange={(e) =>
                        setFormData({ ...formData, degree: e.target.value })
                      }
                      placeholder="e.g. B.Tech CS"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-slate-400 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-primary dark:text-blue-400" /> Graduation Year
                    </label>
                    <select
                      name="graduation_year"
                      id="signup-grad-year"
                      value={formData.graduation_year}
                      onChange={(e) =>
                        setFormData({ ...formData, graduation_year: e.target.value })
                      }
                      className="w-full h-10 rounded-lg border border-outline-variant dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs sm:text-sm text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs font-medium"
                    >
                      <option value="">Select year...</option>
                      {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-slate-400 flex items-center gap-1.5">
                    <Code2 className="h-3.5 w-3.5 text-primary dark:text-blue-400" /> Key Skills (comma-separated)
                  </label>
                  <Input
                    name="skills"
                    id="signup-skills"
                    value={formData.skills}
                    onChange={(e) =>
                      setFormData({ ...formData, skills: e.target.value })
                    }
                    placeholder="e.g. Python, Next.js, React, SQL, NLP"
                  />
                  <p className="text-[11px] text-on-surface-variant dark:text-slate-400">
                    Used immediately to calculate precision match scores with active ministry openings.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-1/3 text-xs"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="ai"
                    className="w-2/3 gap-2 font-bold shadow-md"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Creating Profile...
                      </>
                    ) : (
                      <>
                        Complete Registration <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>

        <CardFooter className="justify-center border-t border-outline-variant/30 dark:border-slate-800 pt-4 text-xs text-on-surface-variant dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-primary dark:text-blue-400 font-bold hover:underline ml-1">
            Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
