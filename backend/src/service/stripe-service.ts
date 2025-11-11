import { config } from "../config";
import { logger } from "../utils/logger";
import orderRepository from "../repository/order-repository";
import { OrderStatus, Prisma } from "../../generated/prisma/client";
import Stripe from "stripe";
import cartRepository from "../repository/cart-repository";
import { eventPublisher, EventType } from "../events/publisher";
import { randomUUID } from "crypto";
import { TransactionClient } from "../../generated/prisma/internal/prismaNamespace";

class StripeService {
  async createPaymentIntent(
    orderId: string,
    userId: string,
    tx: Prisma.TransactionClient
  ) {
    try {
      const order = await orderRepository.findById(orderId, tx);

      // 2. Validate the order
      if (!order) {
        throw new Error(`Order ${orderId} not found.`);
      }
      if (order.userId !== userId) {
        throw new Error("User not authorized for this order."); // Security check
      }
      if (order.status !== OrderStatus.pending) {
        throw new Error("Order is not in a pending state.");
      }

      if (order.stripePaymentIntentId) {
        try {
          // Retrieve the existing PI from Stripe
          const existingPI = await config.stripe.paymentIntents.retrieve(
            order.stripePaymentIntentId
          );
          if (existingPI.status === "requires_payment_method") {
            return {
              clientSecret: existingPI.client_secret,
              paymentIntentId: existingPI.id,
            };
          }
        } catch (error) {
          console.log(
            `Could not retrieve existing PI ${order.stripePaymentIntentId}`,
            { error }
          );
        }
      }

      const amountInCents = Math.round(Number(order.totalAmount) * 100);

      const paymentIntent = await config.stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "usd",
        metadata: {
          orderId,
          userId,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      await orderRepository.updatePaymentIntentId(
        orderId,
        paymentIntent.id,
        tx
      );
      await cartRepository.clearCart(userId);

      logger.info(`Payment intent created for order ${orderId}`, {
        paymentIntentId: paymentIntent.id,
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      logger.error(`Failed to create payment intent for order ${orderId}`, {
        error,
      });
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Failed to create payment intent");
    }
  }

  async handleWebhook(signature: string, rawBody: Buffer) {
    try {
      const event = config.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        config.stripeWebhookSecret
      );

      logger.info(`Received Stripe webhook: ${event.type}`, {
        eventId: event.id,
      });

      switch (event.type) {
        case "payment_intent.succeeded":
          await this.handlePaymentSuccess(event.data.object);
          break;

        case "payment_intent.payment_failed":
          await this.handlePaymentFailure(event.data.object);
          break;

        case "payment_intent.canceled":
          await this.handlePaymentCanceled(event.data.object);
          break;

        default:
          break;
      }

      return { received: true };
    } catch (error) {
      logger.error("Stripe webhook error", { error });
      throw error;
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const order = await orderRepository.findByPaymentIntent(paymentIntent.id);

    if (!order) {
      logger.error(`Order not found for payment intent ${paymentIntent.id}`);
      return;
    }

    if (order.status === OrderStatus.pending) {
      await orderRepository.updateStatus(order.id, OrderStatus.processing);

      logger.info(`Order ${order.id} payment succeeded, status updated`, {
        orderId: order.id,
        paymentIntentId: paymentIntent.id,
      });

      await eventPublisher.publish({
        eventId: randomUUID(),
        eventType: EventType.ORDER_PAID,
        timestamp: new Date(),
        userId: order.userId,
        data: {
          orderId: order.id,
          userId: order.userId,
        },
      });
    }
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    const order = await orderRepository.findByPaymentIntent(paymentIntent.id);

    if (!order) {
      logger.error(`Order not found for payment intent ${paymentIntent.id}`);
      return;
    }

    // Don't update status if it's already been handled
    if (order.status !== OrderStatus.pending) {
      logger.warn(
        `Payment failed for an order that is not pending: ${order.id}`
      );
      return;
    }

    // 1. Log the warning (you already do this)
    logger.warn(`Payment failed for order ${order.id}`, {
      orderId: order.id,
      failureMessage: paymentIntent.last_payment_error?.message,
    });

    // 2. OPTIONAL: Update status in your DB
    // You would need to add `payment_failed` to your Prisma enum
    // await orderRepository.updateStatus(order.id, OrderStatus.payment_failed);

    // 3. TODO: Send a "Payment Failed" email to the user.
    // This is for abandoned carts, telling them to come back.
  }

  /**
   * Handle canceled payment
   */
  private async handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
    const order = await orderRepository.findByPaymentIntent(paymentIntent.id);

    if (!order) return;

    logger.info(`Payment canceled for order ${order.id}`, {
      orderId: order.id,
      paymentIntentId: paymentIntent.id,
    });
  }

  /**
   * Refund order payment
   */
  async refundPayment(orderId: string, amount?: number) {
    const order = await orderRepository.findById(orderId);

    if (!order?.stripePaymentIntentId) {
      throw new Error("Order has no payment to refund");
    }

    try {
      const refund = await config.stripe.refunds.create({
        payment_intent: order.stripePaymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
      });

      const isPartialRefund = amount && amount * 100 < refund.amount;

      const newStatus = isPartialRefund
        ? OrderStatus.partially_refunded
        : OrderStatus.refunded;

      await orderRepository.updateStatus(orderId, newStatus);

      logger.info(`Refund created for order ${orderId}`, {
        refundId: refund.id,
        amount: refund.amount / 100,
      });

      return refund;
    } catch (error) {
      logger.error(`Failed to refund order ${orderId}`, { error });
      throw new Error("Failed to process refund");
    }
  }
}

export default new StripeService();
