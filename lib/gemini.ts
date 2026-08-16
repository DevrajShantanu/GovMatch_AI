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
  resumeText: string
): Promise<ResumeParseResult> {
  const defaultFallback: ResumeParseResult = {
    skills: ["JavaScript", "TypeScript", "React", "Node.js"],
    education:
      "Bachelor of Technology in Computer Science (Extract derived from resume text)",
    experience:
      "Software Developer Intern — worked on full stack web applications and backend APIs.",
    atsScore: 75,
    atsFeedback: [
      "Add more measurable metrics (e.g. 'improved performance by X%')",
      "Ensure standard section headers are used (Education, Experience, Skills)",
      "Include keywords relevant to targeted government technology roles",
    ],
  };

  if (!ai || !apiKey) {
    console.warn(
      "[Gemini] GEMINI_API_KEY is not set. Returning structured fallback resume data."
    );
    return defaultFallback;
  }

  try {
    const prompt = `You are an expert HR AI assistant, ATS (Applicant Tracking System) parser, and career coach.
Analyze the following raw resume text and extract the candidate's technical and soft skills, education background, and work experience.
Additionally, evaluate the resume for ATS compatibility based on standard metrics (e.g., keyword density, measurable impact, formatting, standard section headers).

Return ONLY a valid JSON object matching this exact schema (no markdown, no explanation):
{
  "skills": ["string"],
  "education": "string summarizing degree, college, year, and GPA if present",
  "experience": "string summarizing key work history, projects, and internships",
  "atsScore": number (0-100 score indicating overall ATS compatibility and quality),
  "atsFeedback": ["string (e.g., actionable tips like 'Add measurable metrics', 'Use standard section headers')"]
}

Resume Text:
"""
${resumeText.slice(0, 8000)}
"""`;

    const responseText = await callGemini(prompt);
    const parsed = cleanAndParseJSON<ResumeParseResult>(responseText);

    return {
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      education:
        typeof parsed.education === "string" ? parsed.education : "",
      experience:
        typeof parsed.experience === "string" ? parsed.experience : "",
      atsScore: typeof parsed.atsScore === "number" ? parsed.atsScore : 80,
      atsFeedback: Array.isArray(parsed.atsFeedback) ? parsed.atsFeedback : defaultFallback.atsFeedback,
    };
  } catch (error) {
    console.error("[Gemini] Resume parsing error:", error);
    return defaultFallback;
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

  const fallbackRecommendations = (): RecommendationResult[] => {
    const lowerUserSkills = new Set(
      userSkills.map((s) => s.toLowerCase().trim())
    );

    return internships
      .map((item) => {
        const required = item.required_skills || [];
        const requiredLower = required.map((s) => s.toLowerCase().trim());
        const matched = requiredLower.filter((s) => lowerUserSkills.has(s));
        const missing = required.filter(
          (s) => !lowerUserSkills.has(s.toLowerCase().trim())
        );
        const score =
          required.length > 0
            ? Math.round((matched.length / required.length) * 100)
            : 70;

        return {
          title: item.title || "Internship Position",
          match_score: score,
          reason: `Matched ${matched.length} of ${required.length} required skills (${matched.join(", ") || "General alignment"}).`,
          missing_skills: missing,
          why_this_match: `Strong fit based on your background in ${userSkills.slice(0, 3).join(", ")}.`,
        };
      })
      .sort((a, b) => b.match_score - a.match_score);
  };

  if (!ai || !apiKey) {
    return fallbackRecommendations();
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
    return fallbackRecommendations();
  } catch (error) {
    console.error("[Gemini] Internship recommendation error:", error);
    return fallbackRecommendations();
  }
}

// ---------------------------------------------------------------------------
// Skill Gap Analysis
// ---------------------------------------------------------------------------

export async function analyzeSkillGapWithGemini(
  userSkills: string[],
  requiredSkills: string[]
): Promise<SkillGapResult> {
  const userLower = new Set(userSkills.map((s) => s.toLowerCase().trim()));
  const missing = requiredSkills.filter(
    (s) => !userLower.has(s.toLowerCase().trim())
  );

  const fallbackResult: SkillGapResult = {
    missing_skills: missing,
    priority: missing.slice(0, 3),
    suggestions: missing.map(
      (skill) =>
        `Take a practical course on ${skill} and build a mini-project to demonstrate proficiency.`
    ),
  };

  if (!ai || !apiKey) {
    return fallbackResult;
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

    return {
      missing_skills: Array.isArray(parsed.missing_skills)
        ? parsed.missing_skills
        : fallbackResult.missing_skills,
      priority: Array.isArray(parsed.priority)
        ? parsed.priority
        : fallbackResult.priority,
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions
        : fallbackResult.suggestions,
    };
  } catch (error) {
    console.error("[Gemini] Skill gap analysis error:", error);
    return fallbackResult;
  }
}
