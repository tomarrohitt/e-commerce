import { Request } from "express";
import { MinimalUserContext } from "./user-types";

declare global {
  namespace Express {
    interface Request {
      user?: MinimalUserContext;
    }
  }
}

export {};
