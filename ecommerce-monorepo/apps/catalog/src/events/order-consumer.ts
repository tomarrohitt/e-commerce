import {
  EventBusService,
  OrderEventType,
  ProductEventType,
  OrderCreatedEvent,
} from "@ecommerce/common";
import { prisma } from "../config/prisma";

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
            console.error(
              `🚨 FRAUD DETECTED: Order ${orderId} requested ${orderPrice} but real price is ${dbPrice}`,
            );
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
    } catch (error: unknown) {
      let err: string;
      if (error instanceof Error) {
        console.error(`[Catalog] ❌ Stock failed: ${error.message}`);
        err = error.message;
      } else {
        console.error(`[Catalog] ❌ Stock failed: ${error}`);
        err = String(error);
      }

      await this.eventBus.publish(ProductEventType.STOCK_FAILED, {
        eventId: crypto.randomUUID(),
        eventType: ProductEventType.STOCK_FAILED,
        timestamp: new Date().toISOString(),
        data: {
          orderId,
          reason: err,
        },
      });
    }
  }
}
