import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { LoggerFactory, RedisService } from "@ecommerce/common";
import { env } from "../config/env";

const logger = LoggerFactory.create("IdentityService");

const redis = new RedisService({
  url: env.REDIS_URL,
  maxRetries: 3,
  retryDelay: 50,
});

class UserController {
  async update(req: Request, res: Response) {
    const { name } = req.body;

    try {
      const updatedUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: { id: req.user?.id },
          data: {
            name,
          },
        });

        // await userEventLog.queueUserUpdated(tx, {
        //   id: user.id,
        //   email: user.email,
        //   name: user.name,
        // });

        return user;
      });

      await redis.updateSessionData(req.user.sessionId, {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        image: updatedUser.image,
        sessionId: req.user.sessionId,
        name: updatedUser.name,
      });

      res.json(updatedUser);
    } catch (error) {
      logger.error("Update profile failed:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  }
}

export const userController = new UserController();
