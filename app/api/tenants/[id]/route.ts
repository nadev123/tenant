export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateDomain } from "@/lib/validation";
import { verifyToken } from "@/lib/auth";

// GET /api/tenants/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const tenant = await prisma.tenant.findUnique({ where: { id } });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    return NextResponse.json({ tenant });
  } catch (error) {
    console.error("Get tenant error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/tenants/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const token = request.headers
      .get("cookie")
      ?.match(/auth-token=([^;]+)/)?.[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, customDomain } = body;

    if (customDomain && !validateDomain(customDomain)) {
      return NextResponse.json({ error: "Invalid domain format" }, { status: 400 });
    }

    if (customDomain) {
      const existingDomain = await prisma.tenant.findUnique({
        where: { customDomain },
      });

      if (existingDomain && existingDomain.id !== id) {
        return NextResponse.json({ error: "Domain already in use" }, { status: 400 });
      }
    }

    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description || undefined,
        customDomain: customDomain || null,
      },
    });

    return NextResponse.json({ tenant });
  } catch (error) {
    console.error("Update tenant error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
