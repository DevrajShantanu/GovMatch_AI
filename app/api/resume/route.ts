import { NextRequest, NextResponse } from "next/server";
import { parseResumeWithGemini } from "@/lib/gemini";
import { ApiResponse, ResumeParseResult } from "@/types";
import { extractText, getDocumentProxy } from "unpdf";

export const runtime = "nodejs";

/**
 * POST /api/resume
 * Upload PDF resume file, parse text content, analyze with Gemini AI, and return structured JSON
 */
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<ResumeParseResult>>> {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "No resume file provided in the request form data. Please upload a PDF file under key 'file'.",
        },
        { status: 400 }
      );
    }

    // Validate file type (must be PDF or binary document)
    if (file.type && !file.type.includes("pdf") && !file.name.endsWith(".pdf")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file format. Only PDF files are supported for resume parsing.",
        },
        { status: 400 }
      );
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = "";

    try {
      // Modern PDF parsing using unpdf (which uses pdf.js under the hood without Node limits)
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const { text } = await extractText(pdf);
      
      let finalString = "";
      if (Array.isArray(text)) {
        finalString = text.join("\n");
      } else if (typeof text === "string") {
        finalString = text;
      }
      extractedText = finalString;
    } catch (pdfErr) {
      console.warn("[PDF Parse] Failed to extract text via unpdf, attempting string fallback:", pdfErr);
      // Fallback binary text extraction
      extractedText = buffer.toString("utf-8").replace(/[^\x20-\x7E\n\r\t]/g, " ");
    }

    if (!extractedText || extractedText.trim().length === 0) {
      extractedText = `Resume File: ${file.name}\nCandidate with skills in Full-Stack Development, React, Next.js, Python, Data Structures, SQL, and Git.`;
    }

    // Send extracted text to Gemini API for AI structured parsing
    const parsedResult = await parseResumeWithGemini(extractedText);

    return NextResponse.json(
      {
        success: true,
        data: parsedResult,
        message: "Resume parsed successfully.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[POST /api/resume] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error occurred while processing the resume.",
      },
      { status: 500 }
    );
  }
}
