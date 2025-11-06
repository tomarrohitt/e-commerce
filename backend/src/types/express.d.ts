import { Role } from "../../generated/prisma/enums";

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        email: string;
        name: string;
        image?: string | null;
        emailVerified?: boolean;
        role?: string | null;
      };
      session?: {
        id: string;
        userId: string;
        expiresAt: Date;
      };
    }
  }
}

export {};
