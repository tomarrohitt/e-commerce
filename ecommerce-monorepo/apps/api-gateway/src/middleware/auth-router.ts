import "dotenv/config";
import { Request, Response, NextFunction } from "express";
import { GatewayAuthMiddleware } from "./auth-middleware";
import { routeConfigs } from "../config/routes";
import { RouteMatcher } from "./router-matcher";
import { ForbiddenError } from "@ecommerce/common";

export const conditionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const fullPath = new URL(req.originalUrl, process.env.BASE_URL).pathname;

  const config = RouteMatcher.findConfig(fullPath, routeConfigs);

  if (!config) {
    res
      .status(404)
      .json({ success: false, errors: [{ message: "Service not found" }] });
    return;
  }

  const rule = RouteMatcher.findRule(req, config);

  if (!rule) {
    res
      .status(405)
      .json({ success: false, errors: [{ message: "Method not allowed" }] });
    return;
  }

  if (rule.protected) {
    await GatewayAuthMiddleware.authenticate(req, res, () => {});

    if (res.headersSent) return;

    if (rule.adminOnly) {
      const user = req.user;
      if (!user?.id) {
        return next(new ForbiddenError("Unauthorized: Auth required"));
      }
      if (user?.role !== "admin") {
        return next(new ForbiddenError("Admin access required"));
      }
    }
  }

  next();
};
