import { Request, Response, NextFunction } from "express";
import axios from "axios";
import {
  extractToken,
  UserContext,
  NotAuthorizedError,
  DatabaseOpError,
  HttpClient,
  CircuitBreakerOpenError,
  RedisService,
  LoggerFactory,
} from "@ecommerce/common";
import { env } from "../config/env";

const redis = new RedisService({
  url: env.REDIS_URL,
  maxRetries: 3,
  retryDelay: 50,
});

const IDENTITY_PATH = "/api/internal/validate-session";
const INTERNAL_SERVICE_SECRET = env.INTERNAL_SERVICE_SECRET;
const TOKEN_CACHE_TTL = 3600;

const logger = LoggerFactory.create("GatewayService");

interface IdentityResponse {
  valid: boolean;
  data?: UserContext;
  error?: string;
}

const identityClient = new HttpClient({
  baseURL: env.IDENTITY_SERVICE_URL,
  serviceName: "IdentityService",
  circuitBreaker: {
    failureThreshold: 3,
    resetTimeout: 10000,
  },
});

async function validateWithIdentityService(
  token: string,
): Promise<UserContext> {
  try {
    const response = await identityClient.post<IdentityResponse>(
      IDENTITY_PATH,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": INTERNAL_SERVICE_SECRET,
          Cookie: `better-auth.session_token=${token}`,
          "x-skip-cache": "true",
        },
      },
    );
    if (response.valid && response.data) {
      return response.data;
    }

    throw new NotAuthorizedError();
  } catch (error: any) {
    if (error instanceof CircuitBreakerOpenError) {
      logger.error("[Auth] Identity Circuit Open - Fast Failing");
      throw new DatabaseOpError("Login temporarily unavailable");
    }

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new NotAuthorizedError();
      }
      logger.error("Identity service error:", error.message);
    }

    throw new DatabaseOpError("Authentication service unavailable");
  }
}

export class GatewayAuthMiddleware {
  static async authenticate(
    req: Request,
    res: Response,
    next: NextFunction,
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
