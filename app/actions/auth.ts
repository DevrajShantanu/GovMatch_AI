"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";

// ─── Sign Up ──────────────────────────────────────────────────────────────────

export interface SignUpFormState {
  error?: string;
  success?: boolean;
  message?: string;
}

export async function signUpAction(
  _prevState: SignUpFormState,
  formData: FormData
): Promise<SignUpFormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const college = formData.get("college") as string;
  const degree = formData.get("degree") as string;
  const graduationYear = formData.get("graduation_year") as string;
  const skillsRaw = formData.get("skills") as string;

  if (!email || !password || !fullName) {
    return { error: "Please fill in all required fields." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        college,
        degree,
        graduation_year: graduationYear ? parseInt(graduationYear) : undefined,
        skills: skillsRaw
          ? skillsRaw.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        role: "STUDENT",
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    console.error("[Auth] Sign up error:", error.message);
    return { error: error.message };
  }

  if (data.user && !data.session) {
    // Email confirmation required
    return {
      success: true,
      message:
        "Account created! Please check your email to confirm your account before signing in.",
    };
  }

  // User confirmed immediately (e.g., email confirmation disabled)
  redirect("/dashboard");
}

// ─── Sign In ──────────────────────────────────────────────────────────────────

export interface SignInFormState {
  error?: string;
  redirectUrl?: string;
}

export async function signInAction(
  _prevState: SignInFormState,
  formData: FormData
): Promise<SignInFormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return {
        error:
          "Please confirm your email address before signing in. Check your inbox for the verification link.",
      };
    }
    return { error: "Invalid email or password. Please try again." };
  }

  if (!data.user) {
    return { error: "Authentication failed. Please try again." };
  }

  const requestedRole = formData.get("requested_role") as string;

  if (requestedRole === "ADMIN" || requestedRole === "STUDENT") {
    // For demo/hackathon purposes: automatically switch the account role based on login selection
    await supabase.from("profiles").update({ role: requestedRole }).eq("id", data.user.id);
  }

  // Fetch role from profiles table to determine redirect
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profile?.role === "ADMIN") {
    return { redirectUrl: "/admin" };
  } else {
    return { redirectUrl: "/dashboard" };
  }
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// ─── Google OAuth ─────────────────────────────────────────────────────────────

export async function signInWithGoogleAction(): Promise<{ url?: string; error?: string }> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.url) {
    return { error: "Google OAuth is not configured. Please contact the administrator to set up Google sign-in credentials in the Supabase dashboard." };
  }

  return { url: data.url };
}

// ─── Delete Account ───────────────────────────────────────────────────────────

export async function deleteAccountAction(): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: "You must be logged in to delete your account." };
    }

    // Instantiate Admin Supabase Client to bypass RLS and Auth restrictions
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Delete the user from Supabase Auth (This will cascade delete their profile and applications if foreign keys are set up correctly)
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(user.id);
    
    if (deleteError) {
      console.error("[deleteAccountAction] Error deleting user:", deleteError);
      return { error: "Failed to securely delete your account. Please contact support." };
    }

    // Force sign out to clear session cookies
    await supabase.auth.signOut();
    
    return { success: true };
  } catch (error) {
    console.error("[deleteAccountAction] Unexpected error:", error);
    return { error: "An unexpected error occurred during account deletion." };
  }
}
