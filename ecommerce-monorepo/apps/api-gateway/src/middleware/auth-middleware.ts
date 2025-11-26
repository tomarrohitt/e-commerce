import { Request, Response, NextFunction } from "express";
import axios from "axios";
import {
  extractToken,
  redis,
  UserContext,
  NotAuthorizedError,
  DatabaseOpError,
} from "@ecommerce/common";

const IDENTITY_SERVICE_URL =
  "http://localhost:4001/api/internal/validate-session";
const INTERNAL_SERVICE_SECRET = process.env.INTERNAL_SERVICE_SECRET;
const TOKEN_CACHE_TTL = 3600;

async function validateWithIdentityService(
  token: string
): Promise<UserContext> {
  try {
    const response = await axios.post(
      IDENTITY_SERVICE_URL,
      {},
      {
        timeout: 5000,
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": INTERNAL_SERVICE_SECRET,
          Cookie: `better-auth.session_token=${token}`,
          "x-skip-cache": "true",
        },
      }
    );

    if (response.data.valid) {
      return response.data.data;
    }

    throw new NotAuthorizedError();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new NotAuthorizedError();
      }
      console.error("Identity service error:", error.message);
    }

    throw new DatabaseOpError("Authentication service unavailable");
  }
}

export class GatewayAuthMiddleware {
  static async authenticate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = extractToken(req);

      if (!token) {
        throw new NotAuthorizedError();
      }

      const sessionCache = await redis.getSessionByToken(token);
      if (sessionCache) {
        req.user = sessionCache;
        return next();
      }

      const userData = await validateWithIdentityService(token);
      redis
        .saveSessionDualLayer(token, userData, TOKEN_CACHE_TTL)
        .catch((err) => console.warn("[Gateway] Redis save failed:", err));
      req.user = userData;
      next();
    } catch (error) {
      next(error);
    }
  }
}
