import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Prefer proxy-forwarded host/proto when available (CyberPanel/nginx)
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const hostname = forwardedHost || request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;
  const debugFlag = request.nextUrl.searchParams.get("__middleware_debug") === "1" || pathname === "/__middleware_debug";

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
    // Debug: log resolved host and forwarded headers
    console.log("middleware: hostname=", hostname, "forwardedHost=", forwardedHost, "forwardedProto=", forwardedProto, "pathname=", pathname);
    // Forward original host header so the API can resolve custom domains correctly
    const tenantRes = await fetch(new URL("/api/tenants/current", request.url).toString(), {
      headers: {
        host: hostname,
        "x-forwarded-host": hostname,
        "x-forwarded-proto": forwardedProto || request.nextUrl.protocol.replace(":", ""),
      },
      method: "GET",
    });

    console.log("middleware: tenantRes status=", tenantRes.status);

    // If debug, return a small HTML page with details for easier inspection in browser
    if (debugFlag) {
      let jsonBody = null;
      try {
        jsonBody = await tenantRes.clone().json();
      } catch (e) {
        jsonBody = null;
      }
      const bodyHtml = `<!doctype html><html><head><meta charset="utf-8"><title>Middleware Debug</title></head><body><h1>Middleware Debug</h1><pre>hostname: ${hostname}\nforwardedHost: ${forwardedHost}\nforwardedProto: ${forwardedProto}\npathname: ${pathname}\ntenantRes.status: ${tenantRes.status}\ntenantRes.body: ${JSON.stringify(jsonBody, null, 2)}</pre></body></html>`;
      return new Response(bodyHtml, { headers: { "content-type": "text/html; charset=utf-8" } });
    }

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
