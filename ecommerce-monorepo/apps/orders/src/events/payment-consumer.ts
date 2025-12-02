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
        if (event.eventType === OrderEventType.PAYMENT_INTENT_FAILED) {
          const { orderId } = event.data;
          await orderRepository.updateStatus(orderId, OrderStatus.CANCELLED);
        } else if (event.eventType === OrderEventType.CANCELLED) {
          const { paymentId } = event.data;
          if (paymentId) {
            await orderService.processPaymentReversal(paymentId);
          }
        }
      },
    );
  }
}
