import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";
import { conditionalAuth } from "./middleware/auth-router";
import { routeConfigs } from "./config/routes";
import { ClientRequest, ServerResponse } from "http";
import { Request } from "express";
import { GatewayAuthMiddleware } from "./middleware/auth-middleware";
import { requestLogger } from "./middleware/logger";
import { errorHandler } from "@ecommerce/common";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    proxyReq.setHeader("x-user-name", encodeURIComponent(user.name || ""));
    proxyReq.setHeader("x-user-session-id", user.sessionId);
    proxyReq.setHeader(
      "x-internal-secret",
      process.env.INTERNAL_SERVICE_SECRET || ""
    );
  }
  fixRequestBody(proxyReq, req);
};

app.use(requestLogger);

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

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
});
