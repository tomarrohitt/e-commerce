import {
  EventBusService,
  OrderEventType,
  OrderCreatedEvent,
  withRetry,
  LoggerFactory,
} from "@ecommerce/common";
import { stripeService } from "../services/stripe-service";
import { prisma } from "../config/prisma";

const logger = LoggerFactory.create("IdentityService");

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
      if (error.type === "StripeInvalidRequestError") {
        logger.error(`[Async Payment] ❌ Fatal Stripe Error: ${error.message}`);

        await prisma.outboxEvent.create({
          data: {
            aggregateId: orderId,
            eventType: OrderEventType.PAYMENT_INTENT_FAILED,
            payload: { orderId, userId },
          },
        });
        return;
      }

      logger.error(
        `[Async Payment] 🔄 Stripe unavailable after retries. Re-queueing.`,
      );
      throw error;
    }
  }
}
