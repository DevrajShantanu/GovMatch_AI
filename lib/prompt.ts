// ---------------------------------------------------------------------------
// Prompt Engineering Library
//
// All prompts enforce:
//   • JSON-only output (no markdown, no explanations)
//   • Clean, structured data matching our Zod schemas
// ---------------------------------------------------------------------------

/**
 * Builds the recommendation prompt.
 *
 * @param skills      - Candidate's skill list
 * @param interests   - Candidate's interest areas
 * @param resumeText  - Raw resume text (truncated to avoid token overload)
 * @returns Full prompt string for Gemini
 */
export function buildRecommendationPrompt(
  skills: string[],
  interests: string[],
  resumeText: string
): string {
  const truncatedResume = resumeText.slice(0, 6000);

  return `You are an AI Internship Recommendation Engine for a government internship portal.
Your task is to evaluate a candidate's profile and recommend the best-matching internship roles.

STRICT RULES:
- Return ONLY a valid JSON object.
- Do NOT include any markdown, code fences, explanations, or comments.
- Do NOT wrap output in \`\`\`json or any other markers.
- The JSON must be parseable by JSON.parse() directly.

CANDIDATE PROFILE:
Skills: ${JSON.stringify(skills)}
Interests: ${JSON.stringify(interests)}
Resume Excerpt:
"""
${truncatedResume}
"""

Based on this profile, recommend 5 internship roles that would be an excellent fit.
For each recommendation, assign a realistic matchScore (0–100 integer) and write a concise reason.

Return this exact JSON structure and nothing else:
{
  "recommendations": [
    {
      "title": "string — internship role title",
      "matchScore": number,
      "reason": "string — 1–2 sentences explaining why this role fits the candidate"
    }
  ]
}`;
}

/**
 * Builds the skill & interest extraction prompt.
 *
 * @param resumeText  - Raw resume text to parse
 * @returns Full prompt string for Gemini
 */
export function buildExtractPrompt(resumeText: string): string {
  const truncatedResume = resumeText.slice(0, 6000);

  return `You are an expert AI resume parser and skills extractor.
Analyze the following resume text and extract two things:
  1. A comprehensive list of technical and soft skills the candidate possesses.
  2. A list of professional or academic interest areas (e.g., "Machine Learning", "Web Development", "Public Policy").

STRICT RULES:
- Return ONLY a valid JSON object.
- Do NOT include any markdown, code fences, explanations, or comments.
- Do NOT wrap output in \`\`\`json or any other markers.
- The JSON must be parseable by JSON.parse() directly.
- Each entry in both arrays must be a plain string (no objects).
- Aim for 5–20 skills and 3–8 interests.

Resume Text:
"""
${truncatedResume}
"""

Return this exact JSON structure and nothing else:
{
  "skills": ["string", "..."],
  "interests": ["string", "..."]
}`;
}
