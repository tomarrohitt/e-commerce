import {
  EventBusService,
  ProductEventType,
  Event,
  ProductCreatedData,
  ProductDeletedData,
} from "@ecommerce/common";
import { prisma } from "../config/prisma";
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
            case ProductEventType.UPDATED:
            case ProductEventType.STOCK_CHANGED:
            case ProductEventType.PRICE_CHANGED:
              await this.handleProductSync(event.data as ProductCreatedData);
              break;

            case ProductEventType.DELETED:
              await this.handleProductDelete(event.data as ProductDeletedData);
              break;

            case ProductEventType.STOCK_RESERVED:
            case ProductEventType.STOCK_FAILED:
              break;

            default:
              console.warn(
                `[Cart] Unknown event type ignored: ${event.eventType}`,
              );
          }
        } catch (err) {
          console.error(`[Cart] Error processing event ${event.eventId}:`, err);
          throw err;
        }
      },
    );
  }

  private async handleProductSync(data: ProductCreatedData) {
    await prisma.productReplica.upsert({
      where: { id: data.id },
      create: {
        id: data.id,
        name: data.name,
        price: data.price,
        stockQuantity: data.stockQuantity,
        sku: data.sku,
        thumbnail: data.images && data.images.length > 0 ? data.images[0] : "",
        isActive: data.isActive,
      },
      update: {
        name: data.name,
        price: data.price,
        sku: data.sku,
        stockQuantity: data.stockQuantity,
        thumbnail: data.images && data.images.length > 0 ? data.images[0] : "",
        isActive: data.isActive,
      },
    });
    console.log(`[Cart] Synced Replica: product ${data.id}`);
  }

  private async handleProductDelete(data: ProductDeletedData) {
    try {
      await prisma.productReplica.delete({
        where: { id: data.id },
      });

      console.log(`[Cart] 🗑️ Deleted Replica: product ${data.id}`);
    } catch (error) {
      console.log(`[Cart] Product already deleted or not found.`);
    }
  }
}
