import RedisStore from "rate-limit-redis";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

import { env } from "../config/env";
import { RedisService } from "@ecommerce/common";

const redisService = new RedisService({
  url: env.REDIS_URL,
  maxRetries: 3,
  retryDelay: 50,
});

const redis = redisService.getClient();

const normalizeUrl = (url: string): string => {
  let normalized = url.toLowerCase();

  normalized = normalized.split("?")[0];
  normalized = normalized.replace(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g,
    ":id",
  );

  normalized = normalized.replace(/\/(\d+)/g, "/:id");

  if (normalized.endsWith("/") && normalized.length > 1) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
};

const createEndpointKey = (req: any) => {
  const userKey = req.user?.id || ipKeyGenerator(req.ip) || "127.0.0.1";
  const endpoint = normalizeUrl(req.originalUrl);

  return `${userKey}:${req.method}:${endpoint}`;
};

export const generalLimiter = rateLimit({
  store: new RedisStore({
    // @ts-expect-error
    sendCommand: (...args: string[]) => redis.call(...args),
    prefix: "rl:general",
  }),
  windowMs: 5 * 60 * 1000,
  max: 100,
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      success: false,
      errors: [
        {
          message: options.message,
        },
      ],
    });
  },
  message: "Too many requests, please try again later.",

  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.id || ipKeyGenerator(req.ip || "127.0.0.1") || "unknown";
  },
});

export const authLimiter = rateLimit({
  store: new RedisStore({
    // @ts-expect-error
    sendCommand: (...args: string[]) => redis.call(...args),
    prefix: "rl:auth",
  }),
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      success: false,
      errors: [
        {
          message: options.message,
        },
      ],
    });
  },
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts, please try again later.",
  keyGenerator: createEndpointKey,
});

export const writeLimiter = rateLimit({
  store: new RedisStore({
    // @ts-expect-error
    sendCommand: (...args: string[]) => redis.call(...args),
    prefix: "rl:write",
  }),
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      success: false,
      errors: [
        {
          message: options.message,
        },
      ],
    });
  },
  windowMs: 1 * 60 * 1000,
  max: 60,
  skip: (req) => req.method === "GET",
  message: "Too many actions (cart/orders), please slow down.",
  keyGenerator: createEndpointKey,
});

export const adminLimiter = rateLimit({
  store: new RedisStore({
    // @ts-expect-error
    sendCommand: (...args: string[]) => redis.call(...args),
    prefix: "rl:admin",
  }),
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      success: false,
      errors: [
        {
          message: options.message,
        },
      ],
    });
  },

  message: "Too many admin operations, please slow down.",
  windowMs: 1 * 60 * 1000,
  max: 200,
  keyGenerator: createEndpointKey,
});

export const publicLimiter = rateLimit({
  store: new RedisStore({
    // @ts-expect-error
    sendCommand: (...args: string[]) => redis.call(...args),
    prefix: "rl:public",
  }),

  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      success: false,
      errors: [
        {
          message: options.message,
        },
      ],
    });
  },
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: "You are browsing too fast!",
  keyGenerator: createEndpointKey,
});
