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

export const generalLimiter = rateLimit({
  store: new RedisStore({
    // @ts-expect-error
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 5 * 60 * 1000,
  max: 100,
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
  }),
  windowMs: 7 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: "Too many login attempts, please try again later.",
  keyGenerator: (req) => {
    return ipKeyGenerator(req.ip || "127.0.0.1") || "unknown";
  },
});

export const writeLimiter = rateLimit({
  store: new RedisStore({
    // @ts-expect-error
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 60 * 1000,
  max: 20,
  message: "Too many write requests, please slow down.",
  skip: (req) => req.method === "GET",

  keyGenerator: (req) => {
    return ipKeyGenerator(req.ip || "127.0.0.1") || "unknown";
  },
});

export const adminLimiter = rateLimit({
  store: new RedisStore({
    // @ts-expect-error
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 60 * 1000,
  max: 50,
  message: "Too many admin operations, please slow down.",
  keyGenerator: (req) => {
    return req.user?.id || ipKeyGenerator(req.ip || "127.0.0.1") || "unknown";
  },
});

export const publicLimiter = rateLimit({
  store: new RedisStore({
    // @ts-expect-error
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many requests, please try again later.",
  keyGenerator: (req) => {
    return ipKeyGenerator(req.ip || "127.0.0.1") || "unknown";
  },
});
