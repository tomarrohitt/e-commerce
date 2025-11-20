import express from "express";
import { authMiddleware } from "../middleware/auth-middleware";

const router = express.Router();

const INTERNAL_SECRET = process.env.INTERNAL_SERVICE_SECRET;

if (!INTERNAL_SECRET) {
  console.error(
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

router.post(
  "/validate-session",
  requireInternalAuth,
  authMiddleware.setSession
);

router.get(
  "/users/:userId",
  requireInternalAuth,
  authMiddleware.validateSession
);

export default router;
