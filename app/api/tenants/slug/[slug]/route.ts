export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getTenantBySlug } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = await params;
    const tenant = await getTenantBySlug(slug);

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    return NextResponse.json({ tenant });
  } catch (error) {
    console.error("Get tenant by slug error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
