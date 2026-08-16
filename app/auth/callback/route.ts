import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/**
 * OAuth callback handler — Supabase redirects here after Google OAuth.
 * Exchanges the auth code for a session, creates profile for new Google users,
 * then redirects to dashboard.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const user = data.user;

      // For new Google OAuth users — ensure their profile exists in public.profiles
      // (the DB trigger handles email sign-ups, but Google OAuth needs explicit upsert)
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!existingProfile) {
        // Create profile for new Google user
        const googleName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "User";

        await supabase.from("profiles").insert({
          id: user.id,
          email: user.email!,
          full_name: googleName,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          role: "STUDENT",
          skills: [],
          created_at: new Date().toISOString(),
        });
      }

      // Fetch role from profiles to decide where to redirect
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const redirectPath = profile?.role === "ADMIN" ? "/admin" : next;
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  // Something went wrong — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
