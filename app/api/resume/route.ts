import { NextRequest, NextResponse } from "next/server";
import { parseResumeWithGemini } from "@/lib/gemini";
import { ApiResponse, ResumeParseResult } from "@/types";

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

    // Allow PDF and Images for Multimodal Vision
    const isValidFormat = 
      (file.type && (file.type.includes("pdf") || file.type.includes("image"))) || 
      file.name.toLowerCase().endsWith(".pdf") || 
      file.name.toLowerCase().endsWith(".png") ||
      file.name.toLowerCase().endsWith(".jpg") ||
      file.name.toLowerCase().endsWith(".jpeg");

    if (!isValidFormat) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file format. Please upload a PDF, PNG, or JPEG file.",
        },
        { status: 400 }
      );
    }

    // Convert file to Buffer then Base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");
    
    // Determine Mime Type
    let mimeType = file.type;
    if (!mimeType) {
      if (file.name.toLowerCase().endsWith(".pdf")) mimeType = "application/pdf";
      else if (file.name.toLowerCase().endsWith(".png")) mimeType = "image/png";
      else if (file.name.toLowerCase().endsWith(".jpg") || file.name.toLowerCase().endsWith(".jpeg")) mimeType = "image/jpeg";
      else mimeType = "application/pdf"; // Fallback
    }

    // Send raw Base64 natively to Gemini Vision for true Multimodal understanding
    const parsedResult = await parseResumeWithGemini(base64Data, mimeType);

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
