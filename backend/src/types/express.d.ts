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
        role?: Role;
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
