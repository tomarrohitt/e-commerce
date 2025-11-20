import { Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";

import auth from "../config/auth";
import { prisma } from "../config/prisma";
import { redisService, SessionCache } from "@ecommerce/common";

interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
}

class AuthMiddleware {
  async setSession(req: Request, res: Response) {
    try {
      const sessionData = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (!sessionData || !sessionData.session || !sessionData.user) {
        return res.status(401).json({ valid: false });
      }

      const sessionCache: SessionCache = {
        userId: sessionData.user.id,
        email: sessionData.user.email,
        role: sessionData.user.role || "user",
        sessionId: sessionData.session.id,
      };

      await redisService.setSession(
        sessionData.session.id,
        sessionCache,
        60 * 60 * 24 * 7
      );

      res.json({
        valid: true,
        session: sessionCache,
      });
    } catch (error) {
      console.error("Session validation error:", error);
      res.status(401).json({ error: "Session validation failed" });
    }
  }

  async validateSession(req: Request, res: Response) {
    const { userId } = req.params;

    try {
      const cachedUser = await redisService.get<UserResponse>(`user:${userId}`);
      if (cachedUser) {
        return res.json(cachedUser);
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      await redisService.set(`user:${userId}`, user, 60 * 60 * 24 * 7);

      res.json(user);
    } catch (error) {
      console.error(`Failed to fetch user ${userId}:`, error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

export const authMiddleware = new AuthMiddleware();
