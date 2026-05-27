import { prisma } from "../config/prisma";
import { LoggerFactory, UserEventType, withRetry } from "@ecommerce/common";

const logger = LoggerFactory.create("IdentityService");

export async function dispatchUserEvent(
  eventType: UserEventType,
  user: { id: string; name: string | null; email?: string },
  extras: Record<string, any> = {}
) {
  try {
    await withRetry(async () => {
      await prisma.outboxEvent.create({
        data: {
          aggregateId: user.id,
          eventType: eventType,
          payload: {
            userId: user.id,
            name: user.name,
            email: user.email,
            ...extras,
          },
        },
      });
    });
  } catch (error) {
    logger.error(
      "CRITICAL_FAILURE",
      `User created (${user.id}) but Outbox Event (${eventType}) FAILED after retries. Error: ${error}`
    );
  }
}
