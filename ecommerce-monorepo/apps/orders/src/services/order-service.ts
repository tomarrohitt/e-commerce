import { OrderStatus } from "@prisma/client";
import { CreateOrderInput } from "../lib/order-validation-schema";
import { orderRepository } from "../repository/order-repository";
import { stripeService } from "./stripe-service";
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
  Role,
} from "@ecommerce/common";

class OrderService {
  async createOrder(
    user: { id: string; email: string },
    input: CreateOrderInput,
  ) {
    const calculatedTotal = input.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    if (Math.abs(calculatedTotal - input.totalAmount) > 0.05) {
      throw new BadRequestError(
        "Total amount mismatch. Please refresh your cart.",
      );
    }

    const order = await orderRepository.create(
      user.id,
      input.items,
      input.totalAmount,
      input.shippingAddress,
      input.billingAddress,
      null, // Payment ID generated async
    );

    return {
      orderId: order.id,
      status: "PENDING",
      message: "Order accepted. Processing payment initialization...",
    };
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

    const orders = await orderRepository.findByUserId(userId, {
      status: options.status,
      limit: options.limit,
      offset,
    });

    const total = await orderRepository.countUserOrders(userId, options.status);

    return {
      orders,
      pagination: {
        total,
        page: options.page,
        limit: options.limit,
        totalPages: Math.ceil(total / options.limit),
      },
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

  async cancelOrder(orderId: string, userId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError("Order not found");

    if (order.userId !== userId) {
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
      "User requested cancellation",
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

  async processPaymentReversal(paymentId: string) {
    try {
      await stripeService.cancelPaymentIntent(paymentId);
    } catch (error: any) {
      if (error.code === "payment_intent_unexpected_state") {
        await stripeService.refundPayment(paymentId);
      } else {
        console.warn(`[Payment] Reversal warning: ${error.message}`);
      }
    }
  }
}

export const orderService = new OrderService();
