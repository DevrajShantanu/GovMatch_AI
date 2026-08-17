"use server";

import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// We use the service role key for admin actions to bypass RLS and fetch all data securely.
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ─── Admin Fetch Applications ─────────────────────────────────────────────────

export async function getAdminApplicationsAction() {
  const supabase = getAdminClient();
  
  // Verify the requester is actually an admin before returning all data
  const authSupabase = await createSupabaseServerClient();
  const { data: { user } } = await authSupabase.auth.getUser();
  if (!user || user.email !== "shantanu.sarkar3391@gmail.com") {
    throw new Error("Unauthorized access.");
  }

  try {
    const { data, error } = await supabase
      .from("applications")
      .select(`
        id,
        status,
        match_score,
        applied_at,
        profiles (
          id,
          full_name,
          email,
          skills
        ),
        internships (
          id,
          title,
          organization
        )
      `)
      .order("applied_at", { ascending: false });

    if (error) throw new Error(error.message);
    
    return { success: true, data };
  } catch (err: any) {
    console.error("[getAdminApplicationsAction] Error:", err);
    return { success: false, error: err.message };
  }
}

// ─── Update Application Status ────────────────────────────────────────────────

export async function updateApplicationStatusAction(
  applicationId: string,
  newStatus: "Accepted" | "Rejected" | "Accepted",
  justification: string
) {
  const supabase = getAdminClient();
  
  // Verify requester is an admin
  const authSupabase = await createSupabaseServerClient();
  const { data: { user } } = await authSupabase.auth.getUser();
  if (!user || user.email !== "shantanu.sarkar3391@gmail.com") {
    throw new Error("Unauthorized access.");
  }

  try {
    // 1. Update the status and the timestamp in the database
    // Updating applied_at ensures the status update jumps to the top of the user's notification list
    const { data: appData, error: updateError } = await supabase
      .from("applications")
      .update({ 
        status: newStatus,
        notes: justification,
        applied_at: new Date().toISOString()
      })
      .eq("id", applicationId);

    if (updateError) throw new Error(updateError.message);
    
    // Simulate network delay to make the UI button loading state feel natural
    await new Promise((resolve) => setTimeout(resolve, 500));

    return { success: true };
  } catch (err: any) {
    console.error("[updateApplicationStatusAction] Error:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteApplicationAction(applicationId: string) {
  const supabase = getAdminClient();
  
  // Verify requester is an admin
  const authSupabase = await createSupabaseServerClient();
  const { data: { user } } = await authSupabase.auth.getUser();
  if (!user || user.email !== "shantanu.sarkar3391@gmail.com") {
    throw new Error("Unauthorized access.");
  }

  try {
    const { error } = await supabase
      .from("applications")
      .delete()
      .eq("id", applicationId);

    if (error) throw new Error(error.message);

    return { success: true };
  } catch (err: any) {
    console.error("[deleteApplicationAction] Error:", err);
    return { success: false, error: err.message };
  }
}
