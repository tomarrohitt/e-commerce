import {
  EventBusService,
  ProductEventType,
  ProductEvent,
  OrderStatus,
} from "@ecommerce/common";
import { orderRepository } from "../repository/order-repository";
import { stripeService } from "../services/stripe-service";

export class StockConsumer {
  constructor(private eventBus: EventBusService) {}

  async start() {
    await this.eventBus.subscribe<ProductEvent["data"]>(
      "order-service-saga-reply",
      [ProductEventType.STOCK_RESERVED, ProductEventType.STOCK_FAILED],
      async (event: any) => {
        const { orderId, reason } = event.data;

        if (event.eventType === ProductEventType.STOCK_RESERVED) {
          console.log(`[Order] ✅ Stock Confirmed for ${orderId}`);
          await orderRepository.updateStatus(
            orderId,
            OrderStatus.AWAITING_PAYMENT,
          );
        } else if (event.eventType === ProductEventType.STOCK_FAILED) {
          console.warn(
            `[Order] ❌ Stock Failed for ${orderId}. Reason: ${reason}`,
          );

          const order = await orderRepository.findById(orderId);

          if (order && order.status !== OrderStatus.CANCELLED) {
            await orderRepository.updateStatus(orderId, OrderStatus.CANCELLED);

            if (order.paymentId) {
              try {
                console.log(
                  `[Stripe] Attempting to cancel Auth for ${order.paymentId}...`,
                );
                await stripeService.cancelPaymentIntent(order.paymentId);
                console.log(`[Stripe] Authorization Voided.`);
              } catch (err: any) {
                if (err.code === "payment_intent_unexpected_state") {
                  console.log(
                    `[Stripe] Payment was already captured. Issuing REFUND instead...`,
                  );
                  await stripeService.refundPayment(order.paymentId);
                  await orderRepository.updateStatus(
                    orderId,
                    OrderStatus.REFUNDED,
                  );
                  console.log(`[Stripe] Refund Successful.`);
                } else {
                  console.error(`[Stripe] Failed to Cancel/Refund:`, err);
                }
              }
            }
          }
        }
      },
    );
  }
}
