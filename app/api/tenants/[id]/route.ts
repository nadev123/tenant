import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateDomain } from "@/lib/validation";
import { verifyToken } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params, searchParams }: { params: { [key: string]: string }; searchParams: URLSearchParams }
) {
  try {
    const tenant = await prisma.tenant.findUnique({ where: { id: params.id } });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    return NextResponse.json({ tenant });
  } catch (error) {
    console.error("Get tenant error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params, searchParams }: { params: { [key: string]: string }; searchParams: URLSearchParams }
) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = await req.json();
    const { name, description, customDomain } = body;

    if (customDomain && customDomain.trim()) {
      if (!validateDomain(customDomain)) {
        return NextResponse.json({ error: "Invalid domain format" }, { status: 400 });
      }

      const existingDomain = await prisma.tenant.findUnique({ where: { customDomain } });
      if (existingDomain && existingDomain.id !== params.id) {
        return NextResponse.json({ error: "Domain already in use" }, { status: 400 });
      }
    }

    const tenant = await prisma.tenant.update({
      where: { id: params.id },
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
