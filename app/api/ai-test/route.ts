import { GoogleGenAI } from "@google/genai";

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing API key" }),
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: "Say hello like a friendly AI",
    });

    return new Response(
      JSON.stringify({ reply: response.text }),
      { status: 200 }
    );

  } catch (error: any) {
    console.error("ERROR:", error);

    return new Response(
      JSON.stringify({
        error: "AI failed",
        message: error.message,
      }),
      { status: 500 }
    );
  }
}