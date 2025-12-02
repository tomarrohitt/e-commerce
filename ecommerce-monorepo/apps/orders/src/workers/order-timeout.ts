import { prisma } from "../config/prisma";
import { OrderEventType, OrderStatus } from "@ecommerce/common";

export async function checkStaleOrders() {
  const time = new Date(Date.now() - 0.1 * 60 * 1000);

  const stuckOrders = await prisma.order.findMany({
    where: {
      status: {
        in: [OrderStatus.PENDING, OrderStatus.AWAITING_PAYMENT],
      },
      createdAt: { lt: time },
    },
    take: 100,
  });

  console.log(`[Timeout Worker] Found ${stuckOrders.length} stuck orders.`);

  for (const order of stuckOrders) {
    console.log(`⚠️ Order ${order.id} timed out. Cancelling.`);

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CANCELLED },
      });

      await tx.outboxEvent.create({
        data: {
          eventType: OrderEventType.CANCELLED,
          aggregateId: order.id,
          payload: { orderId: order.id },
        },
      });
    });
  }
}
