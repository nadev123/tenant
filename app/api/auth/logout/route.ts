// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/middleware-helpers";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ message: "Logged out" }, { status: 200 });
  return clearAuthCookie(response);
}
