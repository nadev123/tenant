import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  // Extract subdomain/custom domain
  const hostnameParts = hostname.split(".");
  let subdomain: string | null = null;

  // Check if it's localhost with port
  if (hostname.includes("localhost")) {
    // Format: subdomain.localhost:3000
    if (hostnameParts.length > 1 && hostnameParts[0] !== "localhost") {
      subdomain = hostnameParts[0];
    }
  } else {
    // Could be custom domain or subdomain
    if (hostnameParts.length > 2) {
      subdomain = hostnameParts[0];
    }
  }

  // If accessing a tenant subdomain, rewrite the URL to the tenant route
  if (subdomain) {
    // If the path already targets the tenant route, don't rewrite to avoid double-prefixing
    if (pathname.startsWith("/tenant")) {
      return NextResponse.next();
    }
    const targetPath = pathname === "/" ? `/tenant/${subdomain}/dashboard` : `/tenant/${subdomain}${pathname}`;
    return NextResponse.rewrite(new URL(targetPath, request.url));
  }

  // If no subdomain, attempt to resolve a custom domain to a tenant via internal API
  try {
    const tenantRes = await fetch(new URL("/api/tenants/current", request.url).toString(), {
      headers: { host: hostname },
      method: "GET",
    });

    if (tenantRes.ok) {
      const json = await tenantRes.json();
      const tenantSlug = json?.tenant?.slug;
      if (tenantSlug) {
        const targetPath = pathname === "/" ? `/tenant/${tenantSlug}/dashboard` : `/tenant/${tenantSlug}${pathname}`;
        return NextResponse.rewrite(new URL(targetPath, request.url));
      }
    }
  } catch (err) {
    // ignore errors and continue to next response
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
