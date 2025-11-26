import { Request } from "express";

export function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  console.log({ authHeader });

  const cookieToken =
    req.cookies?.["better-auth.session_token"] ||
    req.cookies?.auth_token ||
    req.cookies?.session;

  if (cookieToken) {
    return cookieToken;
  }

  if (req.query.token && typeof req.query.token === "string") {
    return req.query.token;
  }

  return null;
}

export function calculateTTL(expiresAt: string | Date): number {
  const now = Date.now();
  const expiry = new Date(expiresAt).getTime();
  const ttlMs = expiry - now;
  const ttlSeconds = Math.floor(ttlMs / 1000);
  return Math.max(ttlSeconds, 0);
}
