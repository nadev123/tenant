import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./auth";

export async function withAuth(
  request: NextRequest,
  handler: (
    request: NextRequest,
    context: { userId: string; tenantId: string }
  ) => Promise<NextResponse>
) {
  const token =
    request.cookies.get("auth-token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 401 }
    );
  }

  return handler(request, {
    userId: decoded.userId,
    tenantId: decoded.tenantId,
  });
}

export function setAuthCookie(response: NextResponse, token: string, domain?: string) {
  const isProd = process.env.NODE_ENV === "production";

  const cookieOptions: any = {
    httpOnly: true,
    secure: isProd, // require https in production
    // for cross-site requests behind proxies, None+Secure is often required
    sameSite: isProd ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  };

  // Only set a domain when it looks like a proper domain (not localhost or an IP without dot)
  if (domain && typeof domain === "string") {
    const d = domain.replace(/^\./, "");
    const looksLikePublicDomain = d.includes(".") && !d.startsWith("localhost") && !/^\d+\.\d+\.\d+\.\d+$/.test(d);
    if (looksLikePublicDomain) {
      cookieOptions.domain = domain;
    }
  }

  response.cookies.set("auth-token", token, cookieOptions);
  return response;
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.delete("auth-token");
  return response;
}
