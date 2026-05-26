import { UserContext } from "@ecommerce/common";

declare global {
  namespace Express {
    interface Request {
      user: UserContext;
    }
  }
}

export {};
