import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantByDomain } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const hostname = request.headers.get("host") || "";
    
    const tenant = await getTenantByDomain(hostname);

    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        customDomain: tenant.customDomain,
        description: tenant.description,
      },
    });
  } catch (error) {
    console.error("Get current tenant error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
