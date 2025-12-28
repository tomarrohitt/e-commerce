import {
  EventBusService,
  OrderEventType,
  OrderDeliveredEvent,
  LoggerFactory,
} from "@ecommerce/common";
import { prisma } from "../config/prisma";

const logger = LoggerFactory.create("CatalogService");

export class OrderDeliveredConsumer {
  constructor(private eventBus: EventBusService) {}

  async start() {
    await this.eventBus.subscribe<OrderDeliveredEvent["data"]>(
      "catalog-verified-purchase-queue",
      [OrderEventType.DELIVERED],
      async (event) => {
        await this.handleVerifiedPurchase(event.data);
      }
    );
  }

  private async handleVerifiedPurchase(data: OrderDeliveredEvent["data"]) {
    const { userId, items } = data;

    try {
      logger.info(
        `[Catalog] 🚚 Processing verified purchase for User: ${userId}`
      );

      await prisma.$transaction(async (tx) => {
        for (const item of items) {
          await tx.verifiedPurchase.upsert({
            where: {
              userId_productId: {
                userId: userId,
                productId: item.productId,
              },
            },
            update: {},
            create: {
              userId: userId,
              productId: item.productId,
            },
          });
        }
      });

      logger.info(`[Catalog] Permissions granted for ${items.length} items.`);
    } catch (error) {
      logger.error(`[Catalog] Failed to record verified purchase:`, error);
      throw error;
    }
  }
}
