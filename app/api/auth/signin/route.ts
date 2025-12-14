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
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenants: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Compare passwords
    const isValid = await comparePasswords(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const firstTenant = user.tenants[0];
    if (!firstTenant) {
      return NextResponse.json({ error: "No tenant found for this user" }, { status: 401 });
    }

    // Create auth token
    const token = createToken(user.id, firstTenant.id);

    // Determine host and protocol
    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const hostHeader = forwardedHost || request.headers.get("host") || "";
    const hostnameOnly = hostHeader.split(":")[0];
    const port = hostHeader.split(":")[1] ? `:${hostHeader.split(":")[1]}` : "";
    const isLocalhost = hostnameOnly === "localhost" || hostnameOnly === "127.0.0.1";

    // Determine redirect URL
    let redirectUrl: string;

    if (isLocalhost) {
      // Local development: relative URL
      redirectUrl = "/dashboard";
    } else if (firstTenant.customDomain) {
      // Custom domain
      const protocol = forwardedProto ? `${forwardedProto}:` : "https:";
      redirectUrl = `${protocol}//${firstTenant.customDomain}/dashboard`;
    } else {
      // Subdomain on production
      const protocol = forwardedProto ? `${forwardedProto}:` : "https:";
      redirectUrl = `${protocol}//${firstTenant.slug}.${hostnameOnly}${port}/dashboard`;
    }

    // Create response
    const response = NextResponse.redirect(redirectUrl, 302);

    // Set cookie for non-localhost
    if (!isLocalhost) {
      const cookieDomain = firstTenant.customDomain
        ? `.${firstTenant.customDomain.split(":")[0]}`
        : `.${hostnameOnly}`;
      setAuthCookie(response, token, cookieDomain);
    } else {
      // Localhost: just set cookie without domain
      setAuthCookie(response, token);
    }

    return response;
  } catch (error) {
    console.error("Sign in error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
