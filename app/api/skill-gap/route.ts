import { NextRequest, NextResponse } from "next/server";
import { analyzeSkillGapWithGemini } from "@/lib/gemini";
import { ApiResponse, SkillGapRequest, SkillGapResult } from "@/types";

export const runtime = "nodejs";

/**
 * POST /api/skill-gap
 * Accepts candidate userSkills and requiredSkills for an internship/job role.
 * Analyzes missing skills, prioritizes learning order, and provides suggestions via Gemini AI.
 */
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<SkillGapResult>>> {
  try {
    const body: SkillGapRequest = await req.json();
    const { userSkills, requiredSkills } = body;

    // Validate inputs
    if (!userSkills || !Array.isArray(userSkills)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input: 'userSkills' must be an array of skill names.",
        },
        { status: 400 }
      );
    }

    if (!requiredSkills || !Array.isArray(requiredSkills) || requiredSkills.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input: 'requiredSkills' must be a non-empty array of target skill names.",
        },
        { status: 400 }
      );
    }

    // Perform skill gap analysis via Gemini API (with algorithmic fallback)
    const result = await analyzeSkillGapWithGemini(userSkills, requiredSkills);

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: "Skill gap analysis completed successfully.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[POST /api/skill-gap] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error occurred while performing skill gap analysis.",
      },
      { status: 500 }
    );
  }
}
