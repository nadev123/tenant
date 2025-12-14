// app/api/tenants/current/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getTenantByDomain } from "@/lib/db";

const BASE_DOMAIN = "tenant.n6n.net";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const forwardedHost = req.headers.get("x-forwarded-host");
  const host = (forwardedHost ?? req.headers.get("host") ?? "").split(",")[0].trim();
  const hostname = host.split(":")[0];

  let lookupDomain = hostname;
  if (hostname.endsWith(`.${BASE_DOMAIN}`) && hostname !== BASE_DOMAIN) {
    lookupDomain = hostname.replace(`.${BASE_DOMAIN}`, "");
  }

  const tenant = await getTenantByDomain(lookupDomain);
  if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  return NextResponse.json({ tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug, customDomain: tenant.customDomain, description: tenant.description } });
}
