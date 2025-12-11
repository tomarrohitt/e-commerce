import { Request, Response, NextFunction } from "express";
import { GatewayAuthMiddleware } from "./auth-middleware";
import { routeConfigs } from "../config/routes";
import { RouteMatcher } from "./router-matcher";
import { ForbiddenError, sendError } from "@ecommerce/common";
import { env } from "../config/env";

export const conditionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const fullPath = new URL(req.originalUrl, env.BASE_URL).pathname;

  const config = RouteMatcher.findConfig(fullPath, routeConfigs);

  if (!config) {
    sendError(res, 404, "Service not found");
    return;
  }

  const rule = RouteMatcher.findRule(req, config);

  if (!rule) {
    sendError(res, 405, "Method not allowed");
    return;
  }

  if (rule.protected) {
    const onAuthComplete = (err?: any) => {
      if (err) {
        return next(err);
      }
      if (rule.adminOnly) {
        const user = req.user;
        if (user?.role !== "admin") {
          return next(new ForbiddenError("Admin access required"));
        }
      }
      next();
    };

    await GatewayAuthMiddleware.authenticate(req, res, onAuthComplete);
    return;
  }

  next();
};
