// app/api/tenants/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateDomain } from "@/lib/validation";
import { verifyToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tenant = await prisma.tenant.findUnique({ where: { id } });

    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

    return NextResponse.json({ tenant });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = req.cookies.get("auth-token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = await req.json();
    const { name, description, customDomain } = body;

    if (customDomain && !validateDomain(customDomain)) {
      return NextResponse.json({ error: "Invalid domain format" }, { status: 400 });
    }

    if (customDomain) {
      const existing = await prisma.tenant.findUnique({ where: { customDomain } });
      if (existing && existing.id !== id) {
        return NextResponse.json({ error: "Domain already in use" }, { status: 400 });
      }
    }

    const tenant = await prisma.tenant.update({
      where: { id },
      data: { name: name || undefined, description: description || undefined, customDomain: customDomain || null },
    });

    return NextResponse.json({ tenant });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
