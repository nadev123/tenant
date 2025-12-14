// app/api/auth/signin/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // Redirect to NextAuth credentials callback
  return NextResponse.redirect("/api/auth/callback/credentials", 307);
}
