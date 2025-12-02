import {
  EventBusService,
  OrderEventType,
  OrderStatus,
  Event,
} from "@ecommerce/common";
import { orderRepository } from "../repository/order-repository";
import { orderService } from "../services/order-service";

export class PaymentConsumer {
  constructor(private eventBus: EventBusService) {}

  async start() {
    await this.eventBus.subscribe(
      "order-service-payment-updates",
      [OrderEventType.PAYMENT_INTENT_FAILED, OrderEventType.CANCELLED],
      async (event: Event) => {
        console.log(
          `[Payment Worker] Processing ${event.eventType} for ${event.aggregateId}`,
        );
        if (event.eventType === OrderEventType.PAYMENT_INTENT_FAILED) {
          const { orderId, reason } = event.data;
          console.log(
            `[Payment] ❌ Marking Order ${orderId} as FAILED: ${reason}`,
          );
          await orderRepository.updateStatus(orderId, OrderStatus.CANCELLED);
        } else if (event.eventType === OrderEventType.CANCELLED) {
          const { paymentId, orderId } = event.data;
          if (paymentId) {
            console.log(
              `[Payment] 💸 Processing async reversal for Order ${orderId}`,
            );
            await orderService.processPaymentReversal(paymentId);
          }
        }
      },
    );
  }
}
