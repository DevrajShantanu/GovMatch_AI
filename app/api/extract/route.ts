import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateAIJSON } from "@/lib/ai";
import { buildExtractPrompt } from "@/lib/prompt";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const RequestSchema = z.object({
  resumeText: z.string().min(10, "resumeText must be at least 10 characters"),
});

const AIResponseSchema = z.object({
  skills: z.array(z.string()),
  interests: z.array(z.string()),
});

// Fallbacks removed per strict requirements

// ---------------------------------------------------------------------------
// POST /api/extract
// ---------------------------------------------------------------------------

/**
 * POST /api/extract
 *
 * Input:  { resumeText: string }
 * Output: { skills: string[], interests: string[] }
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body.", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { resumeText } = parsed.data;
  const prompt = buildExtractPrompt(resumeText);

  let aiJson: string;
  try {
    aiJson = await generateAIJSON(prompt);
  } catch (err: any) {
    console.error("[POST /api/extract] AI unavailable:", err.message);
    return NextResponse.json({ error: "Failed to extract skills via AI." }, { status: 500 });
  }

  let aiData: unknown;
  try {
    aiData = JSON.parse(aiJson);
  } catch {
    console.error("[POST /api/extract] AI returned invalid JSON");
    return NextResponse.json({ error: "AI returned invalid JSON format." }, { status: 500 });
  }

  const validated = AIResponseSchema.safeParse(aiData);
  if (!validated.success) {
    console.error("[POST /api/extract] AI response schema mismatch");
    return NextResponse.json({ error: "AI response did not match expected schema." }, { status: 500 });
  }

  return NextResponse.json(
    { skills: validated.data.skills, interests: validated.data.interests },
    { status: 200 }
  );
}
