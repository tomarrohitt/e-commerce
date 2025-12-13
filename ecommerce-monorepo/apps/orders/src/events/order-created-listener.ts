import {
  EventBusService,
  OrderEventType,
  withRetry,
  LoggerFactory,
  OrderPaidEvent,
} from "@ecommerce/common";
import { stripeService } from "../services/stripe-service";
import { prisma } from "../config/prisma";

const logger = LoggerFactory.create("OrderService");

export class OrderCreatedListener {
  constructor(private eventBus: EventBusService) {}

  async start() {
    await this.eventBus.subscribe<OrderPaidEvent["data"]>(
      "order-service-payment-processor",
      [OrderEventType.CREATED],
      async (event) => {
        await this.handlePaymentCreation(event.data);
      }
    );
  }

  private async handlePaymentCreation(data: OrderPaidEvent["data"]) {
    const { orderId, userId, totalAmount, userEmail, userName } = data;
    try {
      const payment = await withRetry(
        async () => {
          return await stripeService.createPaymentIntent(totalAmount, {
            userId,
            orderId,
            userEmail,
            userName,
          });
        },
        { retries: 3, delay: 500 }
      );

      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentId: payment.id,
          paymentClientSecret: payment.clientSecret,
          userEmail,
          userName,
        },
      });
    } catch (error: any) {
      if (error.type === "StripeInvalidRequestError") {
        logger.error(`[Async Payment] Fatal Stripe Error: ${error.message}`);

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
        `[Async Payment] 🔄 Stripe unavailable after retries. Re-queueing.`
      );
      throw error;
    }
  }
}
