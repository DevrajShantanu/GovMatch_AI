import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateAIJSON, embedText, cosineSimilarity } from "@/lib/ai";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getAllInternships } from "@/lib/supabase";
import { InternshipItem } from "@/types";

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
// In-Memory Vector Cache (For MVP / Hackathon Performance)
// In production, this would be a pgvector column in Supabase.
// ---------------------------------------------------------------------------
const internshipVectorCache = new Map<string, { vector: number[]; timestamp: number }>();

async function getInternshipVector(internship: InternshipItem): Promise<number[]> {
  const cacheKey = internship.id;
  const cached = internshipVectorCache.get(cacheKey);
  
  // Cache valid for 24 hours
  if (cached && (Date.now() - cached.timestamp < 1000 * 60 * 60 * 24)) {
    return cached.vector;
  }

  // Combine relevant fields to embed the meaning of this internship
  const textToEmbed = `
    Title: ${internship.title}
    Organization: ${internship.organization}
    Category: ${internship.category || "General"}
    Description: ${internship.description}
    Required Skills: ${(internship.required_skills || []).join(", ")}
  `.trim();

  const vector = await embedText(textToEmbed);
  
  internshipVectorCache.set(cacheKey, { vector, timestamp: Date.now() });
  return vector;
}

// Fallbacks removed per strict requirements

// ---------------------------------------------------------------------------
// POST /api/recommend
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // 1. Parse & validate request body
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

  const { skills, interests, resumeText } = parsed.data;

  // 2. Fetch all internships (Real DB or Mock fallback)
  let allInternships: InternshipItem[] = [];
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("internships").select("*").eq("status", "Open");
    if (error) throw error;
    allInternships = data as InternshipItem[];
  } catch (err) {
    console.error("[Vector Search] Supabase fetch failed:", err);
    return NextResponse.json({ error: "Failed to fetch internships from database." }, { status: 500 });
  }

  if (allInternships.length === 0) {
    return NextResponse.json({ recommendations: [] }, { status: 200 });
  }

  try {
    // 3. Generate Vector Embedding for the Candidate
    const candidateText = `
      Skills: ${skills.join(", ")}
      Interests: ${interests.join(", ")}
      Experience Summary: ${resumeText.slice(0, 2000)}
    `.trim();
    
    const candidateVector = await embedText(candidateText);

    // 4. Generate/Retrieve Vectors for all Internships and calculate Cosine Similarity
    const scoredInternships = await Promise.all(
      allInternships.map(async (internship) => {
        try {
          const internshipVector = await getInternshipVector(internship);
          const similarity = cosineSimilarity(candidateVector, internshipVector);
          // Convert [-1, 1] cosine similarity to a [0, 100] percentage match score
          // Generally embeddings are tightly clustered between 0.5 and 1.0, so we normalize aggressively
          const normalizedScore = Math.min(Math.max(Math.round(((similarity - 0.5) / 0.5) * 100), 50), 99);
          
          return { internship, score: normalizedScore };
        } catch (e) {
          return { internship, score: 0 }; // Fallback score if embedding fails for an item
        }
      })
    );

    // 5. Take the Top 5 Semantic Matches
    const topMatches = scoredInternships
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // 6. Use LLM to generate human-readable "reasons" for the matches based on their true semantic fit
    const explanationPrompt = `
      You are an AI career coach. We used Vector Search to find the top matching government internships for this candidate.
      
      Candidate Profile:
      Skills: ${skills.join(", ")}
      Interests: ${interests.join(", ")}
      
      Top Matches Found:
      ${JSON.stringify(topMatches.map(m => ({ title: m.internship.title, score: m.score, required_skills: m.internship.required_skills })))}
      
      Return ONLY a JSON object matching this schema:
      {
        "recommendations": [
          {
            "title": "exact title from the matches above",
            "matchScore": exact score from the matches above,
            "reason": "1 concise sentence explaining exactly why the candidate's specific skills align with this role."
          }
        ]
      }
    `;

    const aiJson = await generateAIJSON(explanationPrompt);
    const aiData = JSON.parse(aiJson);
    const validated = AIResponseSchema.safeParse(aiData);

    if (validated.success) {
      return NextResponse.json({ recommendations: validated.data.recommendations }, { status: 200 });
    } else {
      throw new Error("LLM Explanation failed validation.");
    }

  } catch (err: any) {
    console.error("[POST /api/recommend] Vector Search / AI failed:", err.message);
    return NextResponse.json({ error: "Failed to generate recommendations." }, { status: 500 });
  }
}
