export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantBySlug } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params; // params is a Promise in Next.js 15
    const tenant = await getTenantBySlug(slug);

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    return NextResponse.json({ tenant });
  } catch (error) {
    console.error("Get tenant error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
