import { NextRequest, NextResponse } from "next/server";
import { getAllInternships, createInternship } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ApiResponse, CreateInternshipRequest, InternshipItem } from "@/types";

export const runtime = "nodejs";

/**
 * GET /api/internships
 * Fetch list of all internships from Supabase database (with optional search and category filters)
 */
export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<InternshipItem[]>>> {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;

    // Use server client for reliable server-side Supabase access
    const supabase = await createSupabaseServerClient();
    let query = supabase
      .from("internships")
      .select("*")
      .order("created_at", { ascending: false });

    if (category) query = query.eq("category", category);
    if (search) query = query.ilike("title", `%${search}%`);

    const { data, error } = await query;

    if (error) {
      console.warn("[GET /api/internships] Supabase error, falling back to mock:", error.message);
      // Fallback to lib/supabase.ts mock data
      const fallbackData = await getAllInternships(search, category);
      return NextResponse.json(
        { success: true, data: fallbackData, message: `Retrieved ${fallbackData.length} internships (fallback).` },
        { status: 200 }
      );
    }

    const internships = data as InternshipItem[];
    return NextResponse.json(
      {
        success: true,
        data: internships,
        message: `Successfully retrieved ${internships.length} internships.`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[GET /api/internships] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error occurred while fetching internships.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/internships
 * Create a new internship posting in the database (Admin only)
 */
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<InternshipItem>>> {
  try {
    const body: CreateInternshipRequest = await req.json();
    const { title, organization, location, type, stipend, duration, description, required_skills } = body;

    // Validate mandatory fields
    if (!title || !organization || !location || !type || stipend === undefined || !duration || !description) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: title, organization, location, type, stipend, duration, and description are required.",
        },
        { status: 400 }
      );
    }

    if (!required_skills || !Array.isArray(required_skills)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid field: 'required_skills' must be an array of skill names.",
        },
        { status: 400 }
      );
    }

    // Use server client for authenticated insert
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("internships")
      .insert({
        title,
        organization,
        location,
        type,
        stipend: Number(stipend),
        duration,
        description,
        required_skills,
        category: body.category || "General",
        openings: body.openings || 1,
        ministry_or_department: body.ministry_or_department,
        status: "Open",
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(
      {
        success: true,
        data: data as InternshipItem,
        message: "Internship created successfully.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST /api/internships] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error occurred while creating internship.",
      },
      { status: 500 }
    );
  }
}
