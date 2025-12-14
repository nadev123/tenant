// app/api/auth/signup/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createToken } from "@/lib/auth";
import { validateEmail, validatePassword, validateSlug } from "@/lib/validation";
import { setAuthCookie } from "@/lib/middleware-helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, confirmPassword, name, tenantName, tenantSlug } = body;

    // Validation
    if (!email || !validateEmail(email)) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    if (!password || !validatePassword(password)) return NextResponse.json({ error: "Password invalid" }, { status: 400 });
    if (password !== confirmPassword) return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    if (!name || name.trim().length < 2) return NextResponse.json({ error: "Name too short" }, { status: 400 });
    if (!tenantName || tenantName.trim().length < 2) return NextResponse.json({ error: "Tenant name too short" }, { status: 400 });
    if (!tenantSlug || !validateSlug(tenantSlug)) return NextResponse.json({ error: "Invalid tenant slug" }, { status: 400 });

    // Check existing user/tenant
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return NextResponse.json({ error: "Email already registered" }, { status: 400 });

    const existingTenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (existingTenant) return NextResponse.json({ error: "Tenant slug taken" }, { status: 400 });

    // Create user
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({ data: { email, password: hashedPassword, name } });

    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: tenantName,
        slug: tenantSlug,
        users: { connect: [{ id: user.id }] },
        settings: { create: {} },
      },
    });

    // Create JWT
    const token = createToken(user.id, tenant.id);

    const response = NextResponse.json({
      message: "Account created",
      user: { id: user.id, email: user.email, name: user.name },
      tenant: { id: tenant.id, slug: tenant.slug },
    }, { status: 201 });

    return setAuthCookie(response, token);

  } catch (error) {
    console.error("Sign up error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
