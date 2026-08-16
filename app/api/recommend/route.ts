import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateAIJSON } from "@/lib/ai";
import { buildRecommendationPrompt } from "@/lib/prompt";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Request / Response Zod Schemas
// ---------------------------------------------------------------------------

const RequestSchema = z.object({
  skills: z
    .array(z.string().min(1))
    .min(1, "At least one skill is required"),
  interests: z.array(z.string().min(1)).default([]),
  resumeText: z.string().min(1, "resumeText must not be empty"),
});

const RecommendationItemSchema = z.object({
  title: z.string(),
  matchScore: z.number().int().min(0).max(100),
  reason: z.string(),
});

const AIResponseSchema = z.object({
  recommendations: z.array(RecommendationItemSchema).min(1),
});

// ---------------------------------------------------------------------------
// Deterministic fallback when Gemini is unavailable (rate limit etc.)
// ---------------------------------------------------------------------------

const FALLBACK_ROLES = [
  {
    title: "AI Policy & Governance Research Intern",
    keywords: ["python", "nlp", "ai", "data science", "public policy", "machine learning"],
    reason: "Strong match based on your AI and data science skills relevant to public sector technology governance.",
  },
  {
    title: "Full-Stack E-Governance Platform Intern",
    keywords: ["next.js", "react", "typescript", "node.js", "sql", "rest api", "javascript"],
    reason: "Your web development skills align well with government digital infrastructure projects.",
  },
  {
    title: "Data Science & Citizen Analytics Intern",
    keywords: ["python", "sql", "data visualization", "machine learning", "pandas", "statistics"],
    reason: "Your data analysis capabilities are suited for citizen services analytics and reporting.",
  },
  {
    title: "Cybersecurity Anomaly Detection Intern",
    keywords: ["python", "network security", "linux", "docker", "machine learning", "security"],
    reason: "Your technical skills are applicable to national cybersecurity monitoring systems.",
  },
  {
    title: "Blockchain Solutions Intern",
    keywords: ["solidity", "blockchain", "web3", "javascript", "typescript", "smart contracts"],
    reason: "Your programming background maps to Reserve Bank Innovation Hub blockchain initiatives.",
  },
];

function generateFallbackRecommendations(skills: string[], interests: string[]) {
  const userTerms = [...skills, ...interests].map((s) => s.toLowerCase());

  return FALLBACK_ROLES
    .map((role) => {
      const matchCount = role.keywords.filter((kw) =>
        userTerms.some((term) => term.includes(kw) || kw.includes(term))
      ).length;
      const matchScore = Math.min(
        40 + Math.round((matchCount / role.keywords.length) * 60),
        98
      );
      return { title: role.title, matchScore, reason: role.reason };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

// ---------------------------------------------------------------------------
// POST /api/recommend
// ---------------------------------------------------------------------------

/**
 * POST /api/recommend
 *
 * Input:  { skills: string[], interests: string[], resumeText: string }
 * Output: { recommendations: [{ title, matchScore, reason }], fallback?: boolean }
 */
export async function POST(req: NextRequest) {
  // 1. Parse & validate request body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid request body.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { skills, interests, resumeText } = parsed.data;

  // 2. Build structured prompt
  const prompt = buildRecommendationPrompt(skills, interests, resumeText);

  // 3. Call Gemini and parse JSON — fall back gracefully on failure
  let aiJson: string;
  try {
    aiJson = await generateAIJSON(prompt);
  } catch (err: any) {
    console.warn("[POST /api/recommend] AI unavailable, using fallback:", err.message);
    const fallbackRecs = generateFallbackRecommendations(skills, interests);
    return NextResponse.json(
      { recommendations: fallbackRecs, fallback: true },
      { status: 200 }
    );
  }

  // 4. Validate AI response shape
  let aiData: unknown;
  try {
    aiData = JSON.parse(aiJson);
  } catch {
    console.warn("[POST /api/recommend] AI returned invalid JSON, using fallback:", aiJson);
    const fallbackRecs = generateFallbackRecommendations(skills, interests);
    return NextResponse.json(
      { recommendations: fallbackRecs, fallback: true },
      { status: 200 }
    );
  }

  const validated = AIResponseSchema.safeParse(aiData);
  if (!validated.success) {
    console.warn("[POST /api/recommend] AI response failed schema validation, using fallback");
    const fallbackRecs = generateFallbackRecommendations(skills, interests);
    return NextResponse.json(
      { recommendations: fallbackRecs, fallback: true },
      { status: 200 }
    );
  }

  // 5. Return clean AI response
  return NextResponse.json(
    { recommendations: validated.data.recommendations },
    { status: 200 }
  );
}
