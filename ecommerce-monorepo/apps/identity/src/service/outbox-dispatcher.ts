import { prisma } from "../config/prisma";
import { UserEventType, withRetry } from "@ecommerce/common";

export async function dispatchUserEvent(
  eventType: UserEventType,
  user: { id: string; name: string | null; email: string },
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
    console.error(
      "CRITICAL_FAILURE",
      `User created (${user.id}) but Outbox Event (${eventType}) FAILED after retries. Error: ${error}`
    );
  }
}
