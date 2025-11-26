import { redis } from "@ecommerce/common";

export class UserEventLog {
  async queueUserCreated(
    tx: any,
    user: { id: string; email: string; name: string }
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
    tx: any,
    user: { id: string; email: string; name: string }
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

  async queueUserDeleted(tx: any, userId: string) {
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
