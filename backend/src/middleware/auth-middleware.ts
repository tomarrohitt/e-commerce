import { fromNodeHeaders } from "better-auth/node";
import { Response, NextFunction, Request } from "express";

import auth from "../config/auth";
import { Role } from "../../generated/prisma/enums";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== Role.admin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = session.user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}
