import {
  EventBusService,
  OrderEventType,
  ProductEventType,
  OrderCreatedEvent,
  LoggerFactory,
} from "@ecommerce/common";
import { prisma } from "../config/prisma";

const logger = LoggerFactory.create("CatalogService");

export class OrderCreatedConsumer {
  constructor(private eventBus: EventBusService) {}

  async start() {
    await this.eventBus.subscribe<OrderCreatedEvent["data"]>(
      "catalog-stock-reservation-queue",
      [OrderEventType.CREATED],
      async (event) => {
        await this.handleStockReservation(event.data);
      },
    );
  }

  private async handleStockReservation(data: OrderCreatedEvent["data"]) {
    const { orderId, items } = data;

    try {
      await prisma.$transaction(async (tx) => {
        for (const item of items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });
          if (!product || product.stockQuantity < item.quantity) {
            throw new Error(
              `Product ${product?.name || item.productId} is out of stock`,
            );
          }

          const dbPrice = Number(product.price);
          const orderPrice = Number(item.price);

          if (Math.abs(dbPrice - orderPrice) > 0.01) {
            throw new Error(
              `Price mismatch for ${product.name}. Real price: ${dbPrice}`,
            );
          }

          const updatedProduct = await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { decrement: item.quantity } },
          });

          await tx.outboxEvent.create({
            data: {
              eventType: ProductEventType.STOCK_CHANGED,
              aggregateId: updatedProduct.id,
              payload: {
                id: updatedProduct.id,
                name: updatedProduct.name,
                price: updatedProduct.price.toString(),
                sku: updatedProduct.sku,
                stockQuantity: updatedProduct.stockQuantity,
                isActive: updatedProduct.isActive,
                images: updatedProduct.images,
                categoryId: updatedProduct.categoryId,
                createdAt: updatedProduct.createdAt.toISOString(),
              },
            },
          });
        }
        await tx.outboxEvent.create({
          data: {
            eventType: ProductEventType.STOCK_RESERVED,
            aggregateId: orderId,
            payload: { orderId, timestamp: new Date().toISOString() },
          },
        });
      });
    } catch (error: any) {
      const errorMessage = error.message || "Stock Reservation Failed";
      logger.error(`[Catalog] ❌ Stock failed: ${errorMessage}`);

      await prisma.outboxEvent.create({
        data: {
          eventType: ProductEventType.STOCK_FAILED,
          aggregateId: orderId,
          payload: {
            orderId,
            reason: errorMessage,
          },
        },
      });
    }
  }
}
