import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import {
  LoggerFactory,
  RedisService,
  sendError,
  sendSuccess,
  UserEventType,
} from "@ecommerce/common";
import { env } from "../config/env";
import { dispatchUserEvent } from "../service/outbox-dispatcher";
import { Prisma } from "../generated/prisma-client";

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
      const updatedUser = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const user = await tx.user.update({
            where: { id: req.user?.id },
            data: {
              name,
            },
          });

          return user;
        },
      );

      await redis.updateSessionData(req.user.sessionId, {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        image: updatedUser.image,
        sessionId: req.user.sessionId,
        name: updatedUser.name,
      });

      await dispatchUserEvent(
        UserEventType.UPDATED,
        { id: updatedUser.id, name: updatedUser.name },
        { image: updatedUser.image },
      );

      sendSuccess(res, updatedUser);
    } catch (error) {
      logger.error("Update profile failed:", error);
      sendError(res, 500, "Failed to update profile");
    }
  }
}

export const userController = new UserController();
