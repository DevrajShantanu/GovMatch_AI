/**
 * lib/gemini.ts
 *
 * Legacy Gemini helper — updated to use @google/genai (new SDK) with caching and request deduplication.
 * Existing routes (skill-gap, resume, etc.) import from here.
 *
 * NOTE: New routes (recommend, extract) use lib/ai.ts + lib/prompt.ts instead.
 */

import { GoogleGenAI } from "@google/genai";
import {
  ResumeParseResult,
  RecommendationResult,
  SkillGapResult,
  InternshipItem,
} from "@/types";

// ---------------------------------------------------------------------------
// Client setup
// ---------------------------------------------------------------------------

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const MODEL_NAME = "gemini-3.5-flash-lite";

// ---------------------------------------------------------------------------
// In-memory Cache & In-Flight Request Deduplication
// ---------------------------------------------------------------------------
const geminiCache = new Map<string, { data: any; timestamp: number }>();
const geminiInFlight = new Map<string, Promise<string>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 mins

function cleanAndParseJSON<T>(text: string): T {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  return JSON.parse(cleaned) as T;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Shared helper: send a prompt and return the raw text response.
 * Uses request deduplication and in-memory cache to prevent quota exhaustion.
 */
async function callGemini(prompt: string, bypassCache = false): Promise<string> {
  if (!ai || !apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Add it to your .env.local file."
    );
  }

  const cacheKey = prompt.trim().replace(/\s+/g, " ");

  if (!bypassCache) {
    const cached = geminiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }

  const inFlight = geminiInFlight.get(cacheKey);
  if (inFlight && !bypassCache) {
    return inFlight;
  }

  const execution = (async () => {
    for (let attempt = 0; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
        });

        const text = response.text;
        if (!text || text.trim() === "") {
          throw new Error("Gemini returned an empty response.");
        }
        const clean = text.trim();
        geminiCache.set(cacheKey, { data: clean, timestamp: Date.now() });
        return clean;
      } catch (err: any) {
        const msg = err?.message ?? "";
        const isRateLimit = msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota") || msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("high demand");
        if (isRateLimit && attempt < 2) {
          const retryMatch = msg.match(/retry in (\d+)/i);
          const delayMs = retryMatch ? parseInt(retryMatch[1], 10) * 1000 + 1000 : 10000 * (attempt + 1);
          console.warn(`[Gemini] Rate limited. Retrying in ${Math.round(delayMs / 1000)}s...`);
          await sleep(delayMs);
          continue;
        }
        throw err;
      }
    }
    throw new Error("Gemini call failed after retries.");
  })();

  geminiInFlight.set(cacheKey, execution);

  try {
    return await execution;
  } finally {
    geminiInFlight.delete(cacheKey);
  }
}

// ---------------------------------------------------------------------------
// Resume Parsing
// ---------------------------------------------------------------------------

/**
 * Parse a resume text with Gemini.
 * Returns { skills, education, experience }.
 */
export async function parseResumeWithGemini(
  base64Data: string,
  mimeType: string
): Promise<ResumeParseResult> {
  if (!ai || !apiKey) {
    throw new Error("GEMINI_API_KEY is not configured. Cannot parse resume.");
  }

  try {
    const prompt = `You are an expert HR AI assistant, ATS (Applicant Tracking System) parser, and career coach.
Analyze the following raw resume text and extract the candidate's technical and soft skills, education background, and work experience.

You must also act as a strict ATS evaluator. Grade the resume against these industry-standard metrics:
1. Quantification: Does the candidate use numbers and metrics (e.g., "Increased sales by 20%")?
2. Action Verbs: Do descriptions start with strong action verbs (e.g., "Led", "Developed")?
3. Buzzwords & Fluff: Avoid generic terms like "hard worker" or "team player".
4. Readability & Structure: Are standard sections easily identifiable?

Return ONLY a valid JSON object matching this exact schema (no markdown, no explanation):
{
  "skills": ["string"],
  "education": "string summarizing degree, college, year, and GPA if present",
  "experience": "string summarizing key work history, projects, and internships",
  "atsScore": number (0-100 strict score indicating overall ATS compatibility and quality),
  "atsFeedback": [
    {
      "type": "strength" | "improvement" | "keyword",
      "message": "string (specific, actionable feedback)"
    }
  ]
}

Ensure there is a healthy mix of 'strength', 'improvement', and 'keyword' feedback types.

Ensure there is a healthy mix of 'strength', 'improvement', and 'keyword' feedback types.

Attached is the raw file of the candidate's resume (could be PDF, PNG, JPEG, etc.). Please read it natively.
`;

    // Direct call with retry logic for rate limits and high demand (503)
    let responseText = "";
    for (let attempt = 0; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    data: base64Data,
                    mimeType: mimeType,
                  },
                },
              ],
            },
          ],
        });

        responseText = response.text || "";
        if (!responseText.trim()) throw new Error("Empty response from multimodal model.");
        break; // Success, exit retry loop
      } catch (err: any) {
        const msg = err?.message ?? "";
        const isRateLimit = msg.includes("429") || msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("high demand");
        if (isRateLimit && attempt < 2) {
          console.warn(`[Gemini Vision] Model unavailable (503). Retrying in ${5 * (attempt + 1)}s...`);
          await sleep(5000 * (attempt + 1));
          continue;
        }
        throw err;
      }
    }
    
    const parsed = cleanAndParseJSON<ResumeParseResult>(responseText);

    return {
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      education: typeof parsed.education === "string" ? parsed.education : "",
      experience: typeof parsed.experience === "string" ? parsed.experience : "",
      atsScore: typeof parsed.atsScore === "number" ? parsed.atsScore : 80,
      atsFeedback: Array.isArray(parsed.atsFeedback) ? parsed.atsFeedback : [],
    };
  } catch (error: any) {
    console.error("[Gemini] Resume parsing error:", error);
    throw new Error(`Failed to parse resume: ${error.message || "Unknown error"}`);
  }
}

// ---------------------------------------------------------------------------
// Internship Recommendation
// ---------------------------------------------------------------------------

export async function recommendInternshipsWithGemini(
  userSkills: string[],
  internships: Partial<InternshipItem>[]
): Promise<RecommendationResult[]> {
  if (!internships || internships.length === 0) {
    return [];
  }

  if (!ai || !apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  try {
    const prompt = `You are an AI Internship Recommendation Engine.
Given a list of user skills and available internship listings, evaluate how well the candidate matches each internship.

User Skills:
${JSON.stringify(userSkills)}

Internships Available:
${JSON.stringify(
  internships.map((i) => ({
    title: i.title,
    organization: i.organization,
    required_skills: i.required_skills,
    description: i.description,
  }))
)}

Return ONLY a JSON ARRAY (no markdown, no explanation) sorted by match_score descending:
[
  {
    "title": "string",
    "match_score": number (0–100),
    "reason": "string",
    "missing_skills": ["string"],
    "why_this_match": "string"
  }
]`;

    const responseText = await callGemini(prompt);
    const parsed = cleanAndParseJSON<RecommendationResult[]>(responseText);

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    throw new Error("Gemini returned invalid or empty recommendations array.");
  } catch (error: any) {
    console.error("[Gemini] Internship recommendation error:", error);
    throw new Error(`Failed to generate recommendations: ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// Skill Gap Analysis
// ---------------------------------------------------------------------------

export async function analyzeSkillGapWithGemini(
  userSkills: string[],
  requiredSkills: string[]
): Promise<SkillGapResult> {
  if (!ai || !apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  try {
    const prompt = `You are an expert AI Tech Career Coach.
Perform a skill gap analysis comparing the candidate's current skills with the required target skills.

Candidate Skills:
${JSON.stringify(userSkills)}

Required Role Skills:
${JSON.stringify(requiredSkills)}

Return ONLY a valid JSON object (no markdown, no explanation):
{
  "missing_skills": ["string"],
  "priority": ["string — top 3–5 high-priority skills to learn first"],
  "suggestions": ["string — actionable advice or learning resources for each gap"]
}`;

    const responseText = await callGemini(prompt);
    const parsed = cleanAndParseJSON<SkillGapResult>(responseText);

    if (!Array.isArray(parsed.missing_skills) || !Array.isArray(parsed.priority) || !Array.isArray(parsed.suggestions)) {
      throw new Error("Gemini returned invalid skill gap JSON structure.");
    }

    return {
      missing_skills: parsed.missing_skills,
      priority: parsed.priority,
      suggestions: parsed.suggestions,
    };
  } catch (error: any) {
    console.error("[Gemini] Skill gap analysis error:", error);
    throw new Error(`Failed to analyze skill gap: ${error.message}`);
  }
}
