import express from "express";
import { IdentityAuthMiddleware } from "../middleware/auth-middleware";
import { env } from "../config/env";
import { LoggerFactory } from "@ecommerce/common";

const logger = LoggerFactory.create("IdentityService");

const internalRouter = express.Router();

const INTERNAL_SECRET = env.INTERNAL_SERVICE_SECRET;

if (!INTERNAL_SECRET) {
  logger.error(
    "FATAL: INTERNAL_SERVICE_SECRET is not set. Internal APIs are insecure."
  );
  process.exit(1);
}

const requireInternalAuth = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const secret = req.headers["x-internal-secret"];

  if (secret !== INTERNAL_SECRET) {
    console.warn(`Unauthorized internal access attempt from IP: ${req.ip}`);
    return res
      .status(403)
      .json({ error: "Forbidden: Invalid Internal Secret" });
  }
  next();
};

internalRouter.post(
  "/validate-session",
  requireInternalAuth,
  async (req, res) => {
    try {
      const result = await IdentityAuthMiddleware.validateToken(req.headers);

      if (result.valid && result.data) {
        return res.json({
          valid: true,
          data: result.data,
        });
      }

      return res.status(401).json({
        valid: false,
        error: result.error || "Invalid session",
      });
    } catch (error) {
      logger.error("Internal validate-session error:", error);
      return res.status(500).json({
        valid: false,
        error: "Internal error",
      });
    }
  }
);

export default internalRouter;
