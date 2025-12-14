// app/api/auth/signin/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePasswords, createToken } from "@/lib/auth";

import { setAuthCookie } from "@/lib/middleware-helpers";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });

    // Find user and tenant
    const user = await prisma.user.findUnique({ where: { email }, include: { tenants: true } });
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const isValid = await comparePasswords(password, user.password);
    if (!isValid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const tenant = user.tenants[0];
    if (!tenant) return NextResponse.json({ error: "No tenant found" }, { status: 401 });

    const token = createToken(user.id, tenant.id);

    const response = NextResponse.json({
      message: "Signed in",
      user: { id: user.id, email: user.email, name: user.name },
      tenant: { id: tenant.id, slug: tenant.slug },
    });

    return setAuthCookie(response, token);

  } catch (error) {
    console.error("Sign in error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
