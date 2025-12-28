import {
  EventBusService,
  OrderEventType,
  ProductEventType,
  OrderCancelledEvent,
  LoggerFactory,
} from "@ecommerce/common";
import { prisma } from "../config/prisma";

const logger = LoggerFactory.create("CatalogService");

export class OrderCancelledConsumer {
  constructor(private eventBus: EventBusService) {}

  async start() {
    await this.eventBus.subscribe<OrderCancelledEvent["data"]>(
      "catalog-stock-release-queue",
      [OrderEventType.CANCELLED],
      async (event) => {
        await this.handleRestock(event.data);
      }
    );
  }

  private async handleRestock(data: OrderCancelledEvent["data"]) {
    const { items, reason } = data;

    if (reason === "Inventory Error" || reason === "Out of Stock") {
      return;
    }
    try {
      await prisma.$transaction(async (tx) => {
        for (const item of items) {
          const updatedProduct = await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { increment: item.quantity } },
          });

          await tx.outboxEvent.create({
            data: {
              eventType: ProductEventType.STOCK_CHANGED,
              aggregateId: updatedProduct.id,
              payload: {
                id: updatedProduct.id,
                stockQuantity: updatedProduct.stockQuantity,
              },
            },
          });
        }
      });
    } catch (error) {
      logger.error(`[Catalog] ❌ Failed to restock:`, error);
      throw error;
    }
  }
}
