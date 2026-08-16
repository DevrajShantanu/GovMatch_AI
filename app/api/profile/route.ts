import { NextRequest, NextResponse } from "next/server";
import { getProfileById, upsertProfile } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ApiResponse, Profile, UpdateProfileRequest } from "@/types";

export const runtime = "nodejs";

/**
 * GET /api/profile
 * Fetch user profile from Supabase database by session or userId query param
 */
export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<Profile>>> {
  try {
    const { searchParams } = new URL(req.url);
    let userId = searchParams.get("userId");

    if (!userId) {
      const supabase = await createSupabaseServerClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
      }
    }

    if (!userId) {
      userId = "usr_101"; // Fallback for unauthenticated dev testing
    }

    const supabase = await createSupabaseServerClient();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !profile) {
      return NextResponse.json(
        {
          success: false,
          error: `Profile not found for userId: '${userId}'.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: profile,
        message: "Profile retrieved successfully.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[GET /api/profile] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error occurred while fetching user profile.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/profile
 * Create or update user profile details in Supabase database
 */
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<Profile>>> {
  try {
    const body: UpdateProfileRequest = await req.json();

    let userId = body.userId;
    const supabase = await createSupabaseServerClient();
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
      }
    }

    if (!userId) {
      userId = "usr_101";
    }

    const updateData = {
      id: userId,
      full_name: body.full_name,
      email: body.email,
      skills: body.skills,
      education: body.education,
      experience: body.experience,
      college: body.college,
      degree: body.degree,
      graduation_year: body.graduation_year,
      location: body.location,
      bio: body.bio,
      resume_url: body.resume_url,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedProfile, error } = await supabase
      .from("profiles")
      .upsert(updateData)
      .select()
      .single();

    if (error || !updatedProfile) {
      throw new Error(error?.message || "Failed to update profile in database");
    }

    return NextResponse.json(
      {
        success: true,
        data: updatedProfile,
        message: "User profile updated successfully.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[POST /api/profile] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error occurred while updating profile.",
      },
      { status: 500 }
    );
  }
}
