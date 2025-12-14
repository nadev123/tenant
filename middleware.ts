import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BASE_DOMAIN = "tenant.n6n.net";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;

  // Ignore API & internals
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const host =
    (forwardedHost ?? request.headers.get("host") ?? "")
      .split(",")[0]
      .trim();

  const hostname = host.split(":")[0];

  let subdomain: string | null = null;

  // localhost (test.localhost:3000)
  if (hostname.endsWith("localhost")) {
    const parts = hostname.split(".");
    if (parts.length > 1) subdomain = parts[0];
  }

  // production subdomain (test.tenant.n6n.net)
  else if (
    hostname !== BASE_DOMAIN &&
    hostname.endsWith(`.${BASE_DOMAIN}`)
  ) {
    subdomain = hostname.replace(`.${BASE_DOMAIN}`, "");
  }

  // Debug
  if (url.searchParams.get("__debug") === "1") {
    return NextResponse.json({
      hostname,
      pathname,
      subdomain,
    });
  }

  // Rewrite subdomain → tenant route
  if (subdomain) {
    if (pathname.startsWith(`/tenant/${subdomain}`)) {
      return NextResponse.next();
    }

    const target =
      pathname === "/"
        ? `/tenant/${subdomain}/dashboard`
        : `/tenant/${subdomain}${pathname}`;

    return NextResponse.rewrite(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
