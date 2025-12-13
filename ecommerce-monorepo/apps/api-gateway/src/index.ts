import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";
import cors from "cors";
import { conditionalAuth } from "./middleware/auth-router";
import { routeConfigs } from "./config/routes";
import { ClientRequest, ServerResponse } from "http";
import { GatewayAuthMiddleware } from "./middleware/auth-middleware";
import { errorHandler, sendError, sendSuccess } from "@ecommerce/common";
import { env } from "./config/env";
import { requestLogger } from "./config/logger";

const app = express();
const PORT = env.PORT || 4000;

app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());
app.use(requestLogger);
app.use(errorHandler);

const rawBodyRoutes = ["/api/orders/webhook"];

app.use((req: Request, res: Response, next: NextFunction) => {
  if (rawBodyRoutes.includes(req.originalUrl)) {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use((req: Request, res: Response, next: NextFunction) => {
  if (rawBodyRoutes.includes(req.originalUrl)) {
    next();
  } else {
    express.urlencoded({ extended: true })(req, res, next);
  }
});

const onProxyReq = (
  proxyReq: ClientRequest,
  req: Request,
  res: ServerResponse
) => {
  const user = req.user;
  if (user) {
    proxyReq.setHeader("x-user-id", user.id);
    proxyReq.setHeader("x-user-email", user.email);
    proxyReq.setHeader("x-user-role", user.role);
    proxyReq.setHeader("x-user-image", user.image || "");
    proxyReq.setHeader("x-user-name", encodeURIComponent(user.name));
    proxyReq.setHeader("x-user-session-id", user.sessionId);
    proxyReq.setHeader("x-internal-secret", env.INTERNAL_SERVICE_SECRET);
  }

  if (!rawBodyRoutes.includes(req.originalUrl)) {
    fixRequestBody(proxyReq, req);
  }
};

app.get("/api/validate", GatewayAuthMiddleware.authenticate, (req, res) => {
  const user = req.user;

  if (!user) {
    return sendError(
      res,
      401,
      "Unauthorized: No authentication token provided"
    );
  }
  return sendSuccess(res, user);
});

routeConfigs.forEach((routeConfig) => {
  app.use(
    routeConfig.path,
    conditionalAuth,
    createProxyMiddleware({
      target: routeConfig.target,
      changeOrigin: true,
      pathRewrite: (_, req) => {
        return req.originalUrl;
      },
      on: {
        proxyReq: onProxyReq,
      },
    })
  );
});

app.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
});
