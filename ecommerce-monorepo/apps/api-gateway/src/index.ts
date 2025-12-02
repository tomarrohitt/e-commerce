import "dotenv/config";
import express, { Request, Response, NextFunction } from "express"; // Import NextFunction
import cookieParser from "cookie-parser";
import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";
import { conditionalAuth } from "./middleware/auth-router";
import { routeConfigs } from "./config/routes";
import { ClientRequest, ServerResponse } from "http";
import { GatewayAuthMiddleware } from "./middleware/auth-middleware";
import { requestLogger } from "./middleware/logger";
import { errorHandler } from "@ecommerce/common";
import { env } from "./config/env";

const app = express();
const PORT = env.PORT || 4000;

// 1. Logger should be FIRST (to capture start time correctly)
app.use(requestLogger);

app.use(cookieParser());

// 2. 🛑 CONDITIONAL BODY PARSING (The Stripe Fix)
// We skip express.json() ONLY for the webhook route.
// This allows the raw stream to pipe directly to the Order Service.
const rawBodyRoutes = ["/api/orders/webhook"];

app.use((req: Request, res: Response, next: NextFunction) => {
  if (rawBodyRoutes.includes(req.originalUrl)) {
    next(); // Skip parsing, let the stream pass through
  } else {
    express.json()(req, res, next); // Parse everything else
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
  res: ServerResponse,
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

  // 3. Only fix body if we actually parsed it!
  // If we skipped parsing (webhook), we don't touch the stream.
  if (!rawBodyRoutes.includes(req.originalUrl)) {
    fixRequestBody(proxyReq, req);
  }
};

// ... Internal routes ...
app.get("/api/validate", GatewayAuthMiddleware.authenticate, (req, res) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      errors: [{ message: "Unauthorized: No authentication token provided" }],
    });
  }
  res.json({
    valid: true,
    user,
  });
});

// ... Proxy Setup ...
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
    }),
  );
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
});
