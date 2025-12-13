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
  const cookieOptions: any = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  };

  if (domain) {
    cookieOptions.domain = domain;
  }

  response.cookies.set("auth-token", token, cookieOptions);
  return response;
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.delete("auth-token");
  return response;
}
