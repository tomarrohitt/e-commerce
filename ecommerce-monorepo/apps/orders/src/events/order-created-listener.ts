import {
  EventBusService,
  OrderEventType,
  OrderCreatedEvent,
  withRetry, // 👈 Import this
} from "@ecommerce/common";
import { stripeService } from "../services/stripe-service";
import { prisma } from "../config/prisma";

export class OrderCreatedListener {
  constructor(private eventBus: EventBusService) {}

  async start() {
    await this.eventBus.subscribe<OrderCreatedEvent["data"]>(
      "order-service-payment-processor",
      [OrderEventType.CREATED],
      async (event) => {
        await this.handlePaymentCreation(event.data);
      },
    );
  }

  private async handlePaymentCreation(data: OrderCreatedEvent["data"]) {
    const { orderId, userId, totalAmount } = data;

    try {
      const payment = await withRetry(
        async () => {
          return await stripeService.createPaymentIntent(totalAmount, {
            userId,
            orderId,
          });
        },
        { retries: 3, delay: 500 },
      );

      // 2. Update DB (Success Path)
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentId: payment.id },
      });

      // 3. Emit Success Event
      await prisma.outboxEvent.create({
        data: {
          aggregateId: orderId,
          eventType: OrderEventType.PAYMENT_INTENT_CREATED,
          payload: {
            orderId,
            userId,
            paymentId: payment.id,
            clientSecret: payment.clientSecret,
          },
        },
      });
    } catch (error: any) {
      // --- ERROR HANDLING STRATEGY ---

      // A. NON-RETRYABLE ERRORS (Fatal)
      // If it's a Bad Request (e.g., Invalid Currency, Amount too small),
      // there is no point returning it to RabbitMQ. Fail the order.
      if (error.type === "StripeInvalidRequestError") {
        console.error(
          `[Async Payment] ❌ Fatal Stripe Error: ${error.message}`,
        );

        await prisma.outboxEvent.create({
          data: {
            aggregateId: orderId,
            eventType: OrderEventType.PAYMENT_INTENT_FAILED,
            payload: { orderId, userId, reason: error.message },
          },
        });
        return; // Stop here. Don't throw (RabbitMQ will ACK).
      }

      // B. RETRYABLE ERRORS (Network / Server Errors)
      // If we got here, 'withRetry' already tried 3 times and failed.
      // Now we throw to RabbitMQ to handle the "Long Retry" (Backoff).
      console.error(
        `[Async Payment] 🔄 Stripe unavailable after retries. Re-queueing.`,
      );
      throw error;
    }
  }
}
