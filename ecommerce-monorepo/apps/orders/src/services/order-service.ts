import { OrderStatus } from "../generated/prisma-client";
import { CreateOrderInput } from "../lib/order-validation-schema";
import { orderRepository } from "../repository/order-repository";
import { stripeService } from "./stripe-service";
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
  RedisService,
  UserContext,
} from "@ecommerce/common";
import { env } from "../config/env";
import { prisma } from "../config/prisma";

const redis = new RedisService({
  url: env.REDIS_URL,
  maxRetries: 3,
  retryDelay: 50,
});

class OrderService {
  async createOrder(
    input: CreateOrderInput & {
      userId: string;
      userEmail: string;
      userName: string;
    },
  ) {
    const subtotal = input.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const taxAmount = Math.round(subtotal * env.TAX_RATE * 100) / 100;

    const calculatedTotal = subtotal + taxAmount;

    if (Math.abs(calculatedTotal - input.totalAmount) > 0.05) {
      throw new BadRequestError(
        `Total amount mismatch. Backend: ${calculatedTotal}, Frontend: ${input.totalAmount}`,
      );
    }

    const reservedItems: { id: string; qty: number }[] = [];

    try {
      for (const item of input.items) {
        const stockKey = `stock:${item.productId}`;
        const remaining = await redis.decrement(stockKey, item.quantity);
        if (remaining < 0) {
          await redis.increment(stockKey, item.quantity);
          throw new BadRequestError(`Item "${item.name}" is out of stock.`);
        }
        reservedItems.push({ id: item.productId, qty: item.quantity });
      }

      const orderData = {
        ...input,
        subtotal,
        tax: taxAmount,
        totalAmount: calculatedTotal,
      };

      const order = await orderRepository.create(orderData, null);

      return {
        orderId: order.id,
        status: "PENDING",
        message: "Order accepted. Processing payment initialization...",
      };
    } catch (error) {
      if (reservedItems.length > 0) {
        console.warn(`[Order] Creation failed. Rolling back.`);
        for (const reserved of reservedItems) {
          await redis.increment(`stock:${reserved.id}`, reserved.qty);
        }
      }
      throw error;
    }
  }

  async getOrderById(orderId: string, userId: string) {
    const order = await orderRepository.findById(orderId);

    if (!order) throw new NotFoundError("Order not found");

    if (order.userId !== userId) {
      throw new ForbiddenError("You do not have permission to view this order");
    }

    return order;
  }

  async getUserOrders(
    userId: string,
    options: { status?: OrderStatus; limit: number; page: number },
  ) {
    const offset = (options.page - 1) * options.limit;

    const data = await orderRepository.findByUserId(userId, {
      status: options.status,
      limit: options.limit,
      offset,
    });

    return {
      ...data,
    };
  }

  async getOrderSummary(userId: string) {
    const [total, pending, completed] = await Promise.all([
      orderRepository.countUserOrders(userId),
      orderRepository.countUserOrders(userId, OrderStatus.PENDING),
      orderRepository.countUserOrders(userId, OrderStatus.DELIVERED),
    ]);

    return { total, pending, completed };
  }

  async cancelOrder(orderId: string, user: UserContext) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError("Order not found");

    if (order.userId !== user.id) {
      throw new ForbiddenError("You can only cancel your own orders");
    }

    if (
      (
        [
          OrderStatus.SHIPPED,
          OrderStatus.DELIVERED,
          OrderStatus.CANCELLED,
          OrderStatus.FAILED,
          OrderStatus.REFUNDED,
        ] as OrderStatus[]
      ).includes(order.status)
    ) {
      throw new BadRequestError(
        `Cannot cancel order in status ${order.status}`,
      );
    }

    return await orderRepository.updateStatus(
      orderId,
      OrderStatus.CANCELLED,
      "User Requested",
    );
  }

  async getPaymentStatus(orderId: string, userId: string) {
    const order = await orderRepository.findById(orderId);

    if (!order) throw new NotFoundError("Order not found");
    if (order.userId !== userId) throw new ForbiddenError("Not authorized");

    if (!order.paymentId) {
      return { status: "pending" };
    }

    const intent = await stripeService.retrievePaymentIntent(order.paymentId);

    return {
      status: "ready",
      clientSecret: intent.client_secret,
      paymentStatus: intent.status,
    };
  }
  async getTotalSpend(userId: string) {
    const totalSpend = await orderRepository.findTotalSpendByUserId(userId);
    return { total: totalSpend._sum.totalAmount };
  }

  async processPaymentReversal(paymentId: string, orderId: string) {
    try {
      const paymentIntent =
        await stripeService.retrievePaymentIntent(paymentId);

      switch (paymentIntent.status) {
        case "succeeded":
          await prisma.$transaction(async (tx) => {
            await tx.order.update({
              where: {
                id: orderId,
              },
              data: { refunded: true },
            });
            await stripeService.refundPayment(paymentId);
          });
          break;

        case "requires_payment_method":
        case "requires_capture":
        case "requires_confirmation":
        case "requires_action":
          await stripeService.cancelPaymentIntent(paymentId);
          break;

        case "canceled":
          console.log(`[Payment] Intent ${paymentId} is already canceled.`);
          break;

        default:
          console.warn(
            `[Payment] Unhandled payment status: ${paymentIntent.status} for ${paymentId}`,
          );
      }
    } catch (error: any) {
      if (
        error.message &&
        error.message.includes("does not have a successful charge to refund")
      ) {
        console.warn(`[Payment] Skipped refund: No charge existed.`);
        return;
      }

      console.error(`[Payment] Reversal failed: ${error.message}`);
    }
  }
}

export const orderService = new OrderService();
