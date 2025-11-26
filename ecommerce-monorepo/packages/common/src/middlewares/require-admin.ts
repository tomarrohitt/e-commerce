import { Request, Response, NextFunction } from "express";
import { UserContext } from "../types/user-types";
import { Role } from "../types/user-types";
import { ForbiddenError } from "../errors/forbidden-error";

interface AuthenticatedRequest extends Request {
  user?: UserContext;
}

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== Role.ADMIN) {
      return next(new ForbiddenError("Admin access required"));
    }
  } catch (err) {
    return res.status(403).json({ error: err });
  }
  next();
};
