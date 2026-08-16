import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * GET /api/health
 *
 * Lightweight health check endpoint used by uptime monitors, load balancers,
 * or the frontend to confirm the API server is alive.
 *
 * Returns: { status: "ok" }
 */
export async function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}
