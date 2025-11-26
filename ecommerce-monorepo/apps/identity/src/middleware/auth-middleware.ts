import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { IncomingHttpHeaders } from "http";
import { calculateTTL, redis, UserContext } from "@ecommerce/common";
import auth from "../config/auth";

export class IdentityAuthMiddleware {
  private static async refreshSessionFromDb(
    token: string,
    headers: IncomingHttpHeaders
  ): Promise<UserContext | null> {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(headers),
    });

    if (!session || new Date(session.session.expiresAt) < new Date()) {
      return null;
    }

    const userData: UserContext = {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role || "user",
      sessionId: session.session.id,
      name: session.user.name,
      image: session.user.image || "",
    };

    const ttl = calculateTTL(session.session.expiresAt);
    await redis.saveSessionDualLayer(token, userData, ttl);

    return userData;
  }

  static async validateToken(
    headers: IncomingHttpHeaders
  ): Promise<{ valid: boolean; data?: UserContext; error?: string }> {
    try {
      // 1. Extract Token
      let token = headers.authorization?.replace("Bearer ", "");
      if (!token && headers.cookie) {
        const match = headers.cookie.match(
          /better-auth\.session_token=([^;]+)/
        );
        token = match ? match[1] : undefined;
      }

      if (!token) return { valid: false, error: "No token provided" };

      const shouldSkipCache = headers["x-skip-cache"] === "true";

      if (!shouldSkipCache) {
        const cachedSession = await redis.getSessionByToken(token);
        if (cachedSession) {
          return { valid: true, data: cachedSession };
        }
      }

      const freshSession = await this.refreshSessionFromDb(token, headers);

      if (!freshSession) {
        return { valid: false, error: "Invalid or expired session" };
      }

      return { valid: true, data: freshSession };
    } catch (error) {
      console.error("Token validation error:", error);
      return { valid: false, error: "Validation failed" };
    }
  }

  static async authenticate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const validation = await IdentityAuthMiddleware.validateToken(req.headers);

    if (!validation.valid || !validation.data) {
      res.status(401).json({
        error: "unauthorized",
        message: validation.error || "Authentication failed",
      });
      return;
    }

    req.user = validation.data;
    next();
  }

  static authorize(...allowedRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res
          .status(401)
          .json({ error: "unauthorized", message: "Auth required" });
        return;
      }

      if (!allowedRoles.includes(req.user.role)) {
        res
          .status(403)
          .json({ error: "forbidden", message: "Insufficient permissions" });
        return;
      }
      next();
    };
  }
}
