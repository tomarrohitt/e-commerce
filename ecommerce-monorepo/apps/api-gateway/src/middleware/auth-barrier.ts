import { Request, Response, NextFunction } from "express";
import { redisService } from "@ecommerce/common";

export const validateSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let sessionId = req.cookies?.["better-auth.session_token"];

  if (!sessionId && req.headers.authorization) {
    sessionId = req.headers.authorization.replace("Bearer ", "");
  }

  if (!sessionId) {
    return res.status(401).json({ error: "Unauthorized: No session provided" });
  }

  try {
    const session = await redisService.getSession(sessionId);

    if (!session) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Session expired or invalid" });
    }
    req.headers["x-user-id"] = session.userId;
    req.headers["x-user-email"] = session.email;
    req.headers["x-user-role"] = session.role;

    await redisService.setSession(sessionId, session, 3600);

    next();
  } catch (error) {
    console.error("Gateway Auth Error:", error);
    res.status(500).json({ error: "Gateway Internal Error" });
  }
};
