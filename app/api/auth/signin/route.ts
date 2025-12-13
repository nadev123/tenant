import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePasswords, createToken } from "@/lib/auth";
import { validateEmail } from "@/lib/validation";
import { setAuthCookie } from "@/lib/middleware-helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenants: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Compare passwords
    const isValid = await comparePasswords(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Get first tenant (user can have multiple)
    const firstTenant = user.tenants[0];

    if (!firstTenant) {
      return NextResponse.json(
        { error: "No tenant found for this user" },
        { status: 401 }
      );
    }

    // Create auth token
    const token = createToken(user.id, firstTenant.id);

    // Determine possible redirect target: customDomain (if set) or tenant subdomain
    const tenantHost = firstTenant.customDomain || null;

    const hostHeader = request.headers.get("host") || ""; // includes port
    const hostnameOnly = hostHeader.split(":")[0];
    const port = hostHeader.split(":")[1] ? `:${hostHeader.split(":")[1]}` : "";

    // If we're on localhost, server-side cookie domain setting won't reliably apply to subdomains.
    const isLocalhost = hostnameOnly === "localhost" || hostnameOnly.endsWith(".localhost");

    // If we have a reachable host and it's not localhost, perform a server-side redirect and set cookie domain
    if (tenantHost && !isLocalhost) {
      // Redirect to custom domain (use https when in production)
      const protocol = request.nextUrl.protocol || (process.env.NODE_ENV === "production" ? "https:" : "http:");
      const redirectUrl = `${protocol}//${tenantHost}/dashboard`;

      const response = NextResponse.redirect(redirectUrl, 302);
      // Set cookie for the tenant host root (use leading dot to include subdomains)
      const domain = tenantHost.startsWith(".") ? tenantHost : `.${tenantHost.split(":")[0]}`;
      setAuthCookie(response, token, domain);
      return response;
    }

    if (!tenantHost && !isLocalhost) {
      // Build subdomain host (e.g. tenant.example.com)
      const rootHost = hostnameOnly;
      const domain = `.${rootHost}`;
      const redirectHost = `${firstTenant.slug}.${rootHost}${port}`;
      const protocol = request.nextUrl.protocol || (process.env.NODE_ENV === "production" ? "https:" : "http:");
      const redirectUrl = `${protocol}//${redirectHost}/dashboard`;

      const response = NextResponse.redirect(redirectUrl, 302);
      setAuthCookie(response, token, domain);
      return response;
    }

    // Fallback (localhost or when cookie domain can't be set): return JSON and let client redirect
    const response = NextResponse.json(
      {
        message: "Signed in successfully",
        user: { id: user.id, email: user.email, name: user.name },
        tenant: { id: firstTenant.id, slug: firstTenant.slug, customDomain: firstTenant.customDomain },
        tenants: user.tenants,
      },
      { status: 200 }
    );

    return setAuthCookie(response, token);
  } catch (error) {
    console.error("Sign in error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
