"use client";

import Link from "next/link";
import { useState, useActionState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
import { Sparkles, ArrowRight, Lock, Mail, Chrome, AlertCircle, CheckCircle2 } from "lucide-react";
import { signInAction, signInWithGoogleAction } from "@/app/actions/auth";

function LoginFormContent() {
  const searchParams = useSearchParams();
  const [role, setRole] = useState<"STUDENT" | "ADMIN">("STUDENT");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const [state, formAction, isPending] = useActionState(signInAction, {});

  useEffect(() => {
    if (state?.redirectUrl) {
      setIsRedirecting(true);
      window.location.href = state.redirectUrl;
    }
  }, [state?.redirectUrl]);

  // Show error from OAuth callback redirect
  const urlError = searchParams.get("error");
  const urlMessage = searchParams.get("message");

  // Handle Google OAuth
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

  return (
    <Card className="w-full max-w-md bg-white dark:bg-slate-900 border-outline-variant/60 dark:border-slate-800 shadow-xl space-y-2">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-ai-gradient text-white shadow-md">
          <Sparkles className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold text-on-surface dark:text-white">Welcome Back</CardTitle>
        <CardDescription className="text-xs sm:text-sm text-on-surface-variant dark:text-slate-400">
          Sign in to access your AI recommendation portal & applications
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error/Success alerts */}
        {(state?.error || urlError) && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-700 dark:text-red-300 animate-slide-right">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{state?.error || "Authentication failed. Please try again."}</span>
          </div>
        )}
        {googleError && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 p-3 text-xs text-amber-800 dark:text-amber-300 animate-slide-right">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{googleError}</span>
          </div>
        )}
        {urlMessage && (
          <div className="flex items-start gap-2 rounded-lg border border-green-200 dark:border-green-900/60 bg-green-50 dark:bg-green-950/40 p-3 text-xs text-green-700 dark:text-green-300 animate-slide-right">
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{urlMessage}</span>
          </div>
        )}

        {/* Role Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-surface-container-high dark:bg-slate-800 border border-outline-variant/40 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setRole("STUDENT")}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
              role === "STUDENT"
                ? "bg-white dark:bg-slate-900 text-primary dark:text-blue-400 shadow-sm"
                : "text-on-surface-variant dark:text-slate-400 hover:text-on-surface dark:hover:text-white"
            }`}
          >
            Student Portal
          </button>
          <button
            type="button"
            onClick={() => setRole("ADMIN")}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
              role === "ADMIN"
                ? "bg-white dark:bg-slate-900 text-primary dark:text-blue-400 shadow-sm"
                : "text-on-surface-variant dark:text-slate-400 hover:text-on-surface dark:hover:text-white"
            }`}
          >
            Admin & Auditor
          </button>
        </div>

        {/* Google OAuth */}
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
          Continue with Google
        </Button>

        <div className="flex items-center gap-3 text-xs text-on-surface-variant dark:text-slate-400">
          <div className="flex-1 h-px bg-outline-variant/40 dark:bg-slate-800" />
          or sign in with email
          <div className="flex-1 h-px bg-outline-variant/40 dark:bg-slate-800" />
        </div>

        {/* Email + Password form */}
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="requested_role" value={role} />
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-slate-400">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-on-surface-variant/60 dark:text-slate-400" />
              <Input
                type="email"
                name="email"
                id="login-email"
                className="pl-9 text-xs sm:text-sm"
                placeholder="you@example.com"
                required
                disabled={isPending || isRedirecting}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-slate-400">
                Password
              </label>
              <span className="text-xs text-primary dark:text-blue-400 font-semibold hover:underline cursor-pointer">
                Forgot?
              </span>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-on-surface-variant/60 dark:text-slate-400" />
              <Input
                type="password"
                name="password"
                id="login-password"
                className="pl-9 text-xs sm:text-sm"
                placeholder="••••••••"
                required
                disabled={isPending || isRedirecting}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="ai"
            className="w-full gap-2 mt-2 font-bold shadow-md"
            disabled={isPending || googleLoading || isRedirecting}
          >
            {isPending || isRedirecting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {isRedirecting ? "Loading Dashboard..." : "Authenticating..."}
              </>
            ) : (
              <>
                {`Sign In as ${role === "STUDENT" ? "Student" : "Admin"}`}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center border-t border-outline-variant/30 dark:border-slate-800 pt-4 text-xs text-on-surface-variant dark:text-slate-400">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary dark:text-blue-400 font-bold hover:underline ml-1">
          Create Profile
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-surface-container-low dark:bg-slate-950 transition-colors">
      <Suspense
        fallback={
          <Card className="w-full max-w-md bg-white dark:bg-slate-900 border-outline-variant/60 dark:border-slate-800 shadow-xl p-8 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
          </Card>
        }
      >
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
