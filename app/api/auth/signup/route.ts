// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createToken } from "@/lib/auth";
import { validateEmail, validatePassword, validateSlug } from "@/lib/validation";
import { setAuthCookie } from "@/lib/middleware-helpers";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email, password, confirmPassword, name, tenantName, tenantSlug } = await req.json();

    // Validation
    if (!email || !validateEmail(email)) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    if (!password || !validatePassword(password)) return NextResponse.json({ error: "Weak password" }, { status: 400 });
    if (password !== confirmPassword) return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    if (!name || !tenantName || !tenantSlug) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

    // Check existing user/tenant
    if (await prisma.user.findUnique({ where: { email } })) return NextResponse.json({ error: "Email exists" }, { status: 400 });
    if (await prisma.tenant.findUnique({ where: { slug: tenantSlug } })) return NextResponse.json({ error: "Tenant exists" }, { status: 400 });

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({ data: { email, password: hashedPassword, name } });

    const tenant = await prisma.tenant.create({
      data: { name: tenantName, slug: tenantSlug, users: { connect: [{ id: user.id }] }, settings: { create: {} } },
    });

    const token = createToken(user.id, tenant.id);

    const response = NextResponse.json({
      message: "Account created",
      user: { id: user.id, email: user.email, name: user.name },
      tenant: { id: tenant.id, slug: tenant.slug },
    }, { status: 201 });

    return setAuthCookie(response, token);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
