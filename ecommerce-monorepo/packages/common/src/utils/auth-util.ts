import { Request } from "express";

export class AuthUtil {
  private static readonly BEARER_PREFIX = "Bearer ";
  private static readonly COOKIE_NAMES = [
    "better-auth.session_token",
    "auth_token",
    "session",
  ];

  static extractToken(req: Request): string | null {
    // Priority 1: Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith(this.BEARER_PREFIX)) {
      return authHeader.substring(this.BEARER_PREFIX.length);
    }

    // Priority 2: Cookies
    for (const cookieName of this.COOKIE_NAMES) {
      const cookieToken = req.cookies?.[cookieName];
      if (cookieToken) {
        return cookieToken;
      }
    }

    // Priority 3: Query parameter
    if (req.query.token && typeof req.query.token === "string") {
      return req.query.token;
    }

    return null;
  }

  static calculateTTL(expiresAt: string | Date): number {
    const now = Date.now();
    const expiry = new Date(expiresAt).getTime();
    const ttlMs = expiry - now;
    const ttlSeconds = Math.floor(ttlMs / 1000);
    return Math.max(ttlSeconds, 0);
  }
}

// Backward compatibility exports
export const extractToken = AuthUtil.extractToken.bind(AuthUtil);
export const calculateTTL = AuthUtil.calculateTTL.bind(AuthUtil);
