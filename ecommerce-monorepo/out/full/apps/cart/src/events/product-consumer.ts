import {
  EventBusService,
  ProductEventType,
  Event,
  ProductCreatedData,
  ProductDeletedData,
  LoggerFactory,
  ProductUpdatedData,
} from "@ecommerce/common";
import { prisma } from "../config/prisma";

const logger = LoggerFactory.create("CartService");

export class ProductConsumer {
  constructor(private eventBus: EventBusService) {}

  async start() {
    await this.eventBus.subscribe(
      "cart-service-product-queue",
      ["product.*"],
      async (event: Event) => {
        try {
          switch (event.eventType) {
            case ProductEventType.CREATED:
              await this.handleProductCreated(event.data);
              break;
            case ProductEventType.UPDATED:
            case ProductEventType.STOCK_CHANGED:
            case ProductEventType.PRICE_CHANGED:
              await this.handleProductUpdated(event.data);
              break;

            case ProductEventType.DELETED:
              await this.handleProductDelete(event.data);
              break;

            default:
              logger.warn(
                `[Cart] Unknown event type ignored: ${event.eventType}`
              );
          }
        } catch (err) {
          logger.error(`[Cart] Error processing event ${event.eventId}:`, err);
          throw err;
        }
      }
    );
  }

  private async handleProductCreated(data: ProductCreatedData) {
    await prisma.productReplica.create({
      data,
      select: { id: true },
    });
  }

  private async handleProductUpdated(data: ProductUpdatedData) {
    await prisma.productReplica.updateMany({
      where: { id: data.id },
      data: data,
    });
  }

  private async handleProductDelete(data: ProductDeletedData) {
    try {
      await prisma.productReplica.deleteMany({
        where: { id: data.id },
      });
    } catch (error) {
      console.log(`[Cart] Product already deleted or not found.`);
    }
  }
}
