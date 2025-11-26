import { Request, Response, NextFunction } from "express";
import { UserContext } from "../types/user-types";

interface AuthenticatedRequest extends Request {
  user?: UserContext;
}

export const currentUser = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.headers["x-user-id"]) {
    return next();
  }

  const nameHeader = req.headers["x-user-name"] as string;
  const name = nameHeader ?? decodeURIComponent(nameHeader);

  try {
    const payload = {
      id: req.headers["x-user-id"] as string,
      email: req.headers["x-user-email"] as string,
      role: req.headers["x-user-role"] as string,
      sessionId: req.headers["x-user-session-id"] as string,
      image: req.headers["x-user-image"] as string,
      name,
    };

    req.user = payload;
  } catch (err) {
    console.error(err);
  }

  next();
};
