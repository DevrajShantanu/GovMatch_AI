import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ApiResponse, InternshipItem } from "@/types";

export const runtime = "nodejs";

/**
 * GET /api/internships/[id]
 * Fetch a single internship by UUID from Supabase.
 * In Next.js 16+, params is a Promise and must be awaited.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<InternshipItem>>> {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Internship ID is required." },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("internships")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: `Internship not found: ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: data as InternshipItem, message: "Internship retrieved successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[GET /api/internships/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
