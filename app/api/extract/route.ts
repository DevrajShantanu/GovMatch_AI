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

// ---------------------------------------------------------------------------
// Keyword-based fallback extraction (when Gemini is unavailable)
// ---------------------------------------------------------------------------

const TECH_KEYWORDS = [
  "Python", "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "SQL", "PostgreSQL",
  "MongoDB", "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Machine Learning", "Deep Learning",
  "NLP", "Data Science", "TensorFlow", "PyTorch", "REST API", "GraphQL", "Git", "Linux",
  "Java", "C++", "Go", "Rust", "Figma", "CSS", "HTML", "Redux", "FastAPI", "Django",
  "Flask", "Blockchain", "Solidity", "Web3", "Pandas", "NumPy", "Scikit-learn",
];

const DOMAIN_KEYWORDS = [
  "AI & Public Policy", "Web Development", "Data Analysis", "Cybersecurity", "Cloud Computing",
  "Software Engineering", "Mobile Development", "System Design", "Research", "DevOps",
];

function extractKeywords(text: string): { skills: string[]; interests: string[] } {
  const lower = text.toLowerCase();
  const skills = TECH_KEYWORDS.filter((kw) => lower.includes(kw.toLowerCase()));
  const interests = DOMAIN_KEYWORDS.filter((kw) => lower.includes(kw.toLowerCase()));
  return {
    skills: skills.length > 0 ? skills : ["Python", "JavaScript", "SQL"],
    interests: interests.length > 0 ? interests : ["Software Engineering", "Web Development"],
  };
}

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
    console.warn("[POST /api/extract] AI unavailable, using keyword fallback:", err.message);
    return NextResponse.json(extractKeywords(resumeText), { status: 200 });
  }

  let aiData: unknown;
  try {
    aiData = JSON.parse(aiJson);
  } catch {
    console.warn("[POST /api/extract] AI returned invalid JSON, using keyword fallback");
    return NextResponse.json(extractKeywords(resumeText), { status: 200 });
  }

  const validated = AIResponseSchema.safeParse(aiData);
  if (!validated.success) {
    console.warn("[POST /api/extract] AI response schema mismatch, using keyword fallback");
    return NextResponse.json(extractKeywords(resumeText), { status: 200 });
  }

  return NextResponse.json(
    { skills: validated.data.skills, interests: validated.data.interests },
    { status: 200 }
  );
}
