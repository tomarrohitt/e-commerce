import { RedisService } from "@ecommerce/common";
import { Prisma } from "@prisma/client";
import { env } from "../config/env";

const redis = new RedisService({
  url: env.REDIS_URL,
  maxRetries: 3,
  retryDelay: 50,
});

export class UserEventLog {
  async queueUserCreated(
    tx: Prisma.TransactionClient,
    user: { id: string; email: string; name: string },
  ) {
    await tx.outboxEvent.create({
      data: {
        aggregateId: user.id,
        eventType: "user.created",
        payload: {
          userId: user.id,
          email: user.email,
          name: user.name,
        },
      },
    });
  }

  async queueUserUpdated(
    tx: Prisma.TransactionClient,
    user: { id: string; email: string; name: string },
  ) {
    await redis.delete(`user:${user.id}`);

    await tx.outboxEvent.create({
      data: {
        aggregateId: user.id,
        eventType: "user.updated",
        payload: {
          userId: user.id,
          email: user.email,
          name: user.name,
          updatedAt: new Date().toISOString(),
        },
      },
    });
  }

  async queueUserDeleted(tx: Prisma.TransactionClient, userId: string) {
    await redis.delete(`user:${userId}`);

    await tx.outboxEvent.create({
      data: {
        aggregateId: userId,
        eventType: "user.deleted",
        payload: {
          userId,
          deletedAt: new Date().toISOString(),
        },
      },
    });
  }
}

export const userEventLog = new UserEventLog();
