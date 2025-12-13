import * as jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

type TokenPayload = { userId: string; tenantId: string; iat?: number; exp?: number };

const JWT_SECRET = process.env.JWT_SECRET ?? "your-secret-key";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function comparePasswords(
  password: string,
  hashedPassword: string
) {
  return bcrypt.compare(password, hashedPassword);
}

export function createToken(userId: string, tenantId: string): string {
  return jwt.sign({ userId, tenantId } as TokenPayload, JWT_SECRET, {
    expiresIn: "30d",
  }) as string;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (err) {
    return null;
  }
}

export function getCookieFromHeaders(headers: Headers, name: string) {
  const cookieHeader = headers?.get?.("cookie") ?? null;
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    const idx = cookie.indexOf("=");
    if (idx === -1) continue;
    const cookieName = cookie.slice(0, idx).trim();
    const cookieValue = cookie.slice(idx + 1);
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}
