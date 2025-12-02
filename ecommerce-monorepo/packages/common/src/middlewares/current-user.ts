import { Request, Response, NextFunction } from "express";
import { UserContext } from "../types/user-types";
import { Logger } from "../services/logger-service";

export interface AuthenticatedRequest extends Request {
  user?: UserContext;
}

export const logger = new Logger("CurrentUser");

export const currentUser = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void => {
  if (!req.headers["x-user-id"]) {
    return next();
  }

  try {
    const nameHeader = req.headers["x-user-name"] as string;
    const name = nameHeader ? decodeURIComponent(nameHeader) : "";

    const user: UserContext = {
      id: req.headers["x-user-id"] as string,
      email: req.headers["x-user-email"] as string,
      role: req.headers["x-user-role"] as string,
      sessionId: req.headers["x-user-session-id"] as string,
      image: (req.headers["x-user-image"] as string) || null,
      name,
    };

    req.user = user;
  } catch (err) {
    logger.error("Error parsing user context:", err);
  }

  next();
};
