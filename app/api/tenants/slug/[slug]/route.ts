export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getTenantBySlug } from "@/lib/db";

interface Params {
  params: { slug: string };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { slug } = params;
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
