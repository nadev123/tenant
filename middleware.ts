import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * CHANGE THIS TO YOUR REAL ROOT DOMAIN
 * (NO protocol, NO subdomain)
 */
const BASE_DOMAIN = "tenant.n6n.net";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;

  // Never touch API / Next internals
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  /* ---------------------------------------------------
   * Resolve host correctly behind reverse proxy
   * --------------------------------------------------- */
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");

  const host =
    (forwardedHost ?? request.headers.get("host") ?? "")
      .split(",")[0]
      .trim();

  const hostname = host.split(":")[0]; // remove port

  /* ---------------------------------------------------
   * Detect tenant subdomain
   * --------------------------------------------------- */
  let subdomain: string | null = null;

  // LOCALHOST (abc.localhost:3000)
  if (hostname.endsWith("localhost")) {
    const parts = hostname.split(".");
    if (parts.length > 1 && parts[0] !== "localhost") {
      subdomain = parts[0];
    }
  }

  // PRODUCTION SUBDOMAIN (abc.tenant.n6n.net)
  else if (
    hostname !== BASE_DOMAIN &&
    hostname !== `www.${BASE_DOMAIN}` &&
    hostname.endsWith(`.${BASE_DOMAIN}`)
  ) {
    subdomain = hostname.replace(`.${BASE_DOMAIN}`, "");
  }

  /* ---------------------------------------------------
   * Debug mode (visit ?__debug=1)
   * --------------------------------------------------- */
  if (url.searchParams.get("__debug") === "1") {
    return new Response(
      JSON.stringify(
        {
          hostname,
          forwardedHost,
          forwardedProto,
          pathname,
          subdomain,
        },
        null,
        2
      ),
      { headers: { "content-type": "application/json" } }
    );
  }

  /* ---------------------------------------------------
   * SUBDOMAIN TENANT ROUTING
   * --------------------------------------------------- */
  if (subdomain) {
    if (pathname.startsWith("/tenant")) {
      return NextResponse.next();
    }

    const target =
      pathname === "/"
        ? `/tenant/${subdomain}/dashboard`
        : `/tenant/${subdomain}${pathname}`;

    return NextResponse.rewrite(new URL(target, request.url));
  }

  /* ---------------------------------------------------
   * CUSTOM DOMAIN RESOLUTION
   * --------------------------------------------------- */
  try {
    const tenantRes = await fetch(
      new URL("/api/tenants/current", request.url),
      {
        headers: {
          host: hostname,
          "x-forwarded-host": hostname,
          "x-forwarded-proto":
            forwardedProto ?? request.nextUrl.protocol.replace(":", ""),
        },
      }
    );

    if (tenantRes.ok) {
      const data = await tenantRes.json();
      const slug = data?.tenant?.slug;

      if (slug) {
        const target =
          pathname === "/"
            ? `/tenant/${slug}/dashboard`
            : `/tenant/${slug}${pathname}`;

        return NextResponse.rewrite(new URL(target, request.url));
      }
    }
  } catch (err) {
    // fail silently
  }

  return NextResponse.next();
}

/* ---------------------------------------------------
 * Matcher
 * --------------------------------------------------- */
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
