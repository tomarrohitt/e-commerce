import { EventBusService, ProductEventType, Event } from "@ecommerce/common";
import { orderRepository } from "../repository/order-repository";
import { stripeService } from "../services/stripe-service";
import { OrderStatus } from "@prisma/client";

export class StockConsumer {
  constructor(private eventBus: EventBusService) {}

  async start() {
    await this.eventBus.subscribe(
      "order-service-saga-reply",
      [ProductEventType.STOCK_RESERVED, ProductEventType.STOCK_FAILED],
      async (event: Event) => {
        const { orderId, reason } = event.data;

        if (event.eventType === ProductEventType.STOCK_RESERVED) {
          await orderRepository.updateStatus(
            orderId,
            OrderStatus.AWAITING_PAYMENT,
          );
        } else if (event.eventType === ProductEventType.STOCK_FAILED) {
          const order = await orderRepository.findById(orderId);
          if (!order) return;

          const nonCancellable = [
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED,
            OrderStatus.CANCELLED,
            OrderStatus.REFUNDED,
          ] as OrderStatus[];

          if (nonCancellable.includes(order.status)) {
            return;
          }

          await orderRepository.updateStatus(
            orderId,
            OrderStatus.CANCELLED,
            "Inventory Error",
          );

          if (order.paymentId) {
            try {
              await stripeService.cancelPaymentIntent(order.paymentId);
            } catch (err: any) {
              if (err.code === "payment_intent_unexpected_state") {
                await stripeService.refundPayment(order.paymentId);
                await orderRepository.updateStatus(
                  orderId,
                  OrderStatus.REFUNDED,
                );
              }
            }
          }
        }
      },
    );
  }
}
