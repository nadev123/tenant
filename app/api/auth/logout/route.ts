export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/middleware-helpers";

export async function POST(request: NextRequest) {
  const response = NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );
  return clearAuthCookie(response);
}
