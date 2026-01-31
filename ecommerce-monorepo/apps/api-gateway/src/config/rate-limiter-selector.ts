import { Request, Response, NextFunction } from "express";
import {
  adminLimiter,
  authLimiter,
  generalLimiter,
  publicLimiter,
  writeLimiter,
} from "../middleware/rate-limiter";

export const selectRateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const path = req.originalUrl;
  const method = req.method;

  if (path.startsWith("/api/auth")) {
    return authLimiter(req, res, next);
  }

  if (
    path.includes("/api/admin") ||
    ((path.startsWith("/api/products") || path.startsWith("/api/category")) &&
      method !== "GET")
  ) {
    return adminLimiter(req, res, next);
  }

  if (
    method === "GET" &&
    (path.startsWith("/api/products") ||
      path.startsWith("/api/category") ||
      path.startsWith("/api/reviews"))
  ) {
    return publicLimiter(req, res, next);
  }

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return writeLimiter(req, res, next);
  }

  return generalLimiter(req, res, next);
};
