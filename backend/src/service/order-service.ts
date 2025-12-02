import addressRepository from "../repository/address-repository";
import cartRepository from "../repository/cart-repository";
import orderRepository from "../repository/order-repository";
import productRepository from "../repository/product-repository";
import cartService from "./cart-service";
import { ValidateUser } from "../types";
import { getSecureWhere } from "../utils/get-where";
import { OrderStatus } from "@prisma/client";
import stripeService from "./stripe-service";
import { eventPublisher, EventType } from "../events/publisher";
import { randomUUID } from "crypto";
import { prisma } from "../config/prisma";

class OrderService {
  async createOrderFromCart(
    user: ValidateUser,
    shippingAddressId: string,
    paymentMethod: string
  ) {
    const where = getSecureWhere(shippingAddressId, user);
    const address = await addressRepository.findById(where);

    if (!address) {
      throw new Error("Shipping address not found or doesn't belong to you");
    }
    const cart = await cartService.getCart(user.id);

    const validation = await cartService.validateCart(user.id);
    if (!validation.valid) {
      throw new Error(`Cannot create order: ${validation.errors.join(", ")}`);
    }

    const orderItems = cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      priceAtPurchase: item.product.price,
    }));

    const totalAmount = cart.totalPrice;
    try {
      const { order, paymentIntent } = await prisma.$transaction(async (tx) => {
        const createdOrder = await orderRepository.create(
          {
            userId: user.id,
            totalAmount,
            shippingAddressId,
            items: orderItems,
          },
          tx
        );

        await Promise.all(
          orderItems.map((item) =>
            productRepository.updateStock(item.productId, -item.quantity, tx)
          )
        );

        let txPaymentIntent: {
          clientSecret: string | null;
          paymentIntentId: string;
        } | null = null;

        if (paymentMethod === "stripe") {
          txPaymentIntent = await stripeService.createPaymentIntent(
            createdOrder.id,
            user.id,
            tx
          );
        }

        return { order: createdOrder, paymentIntent: txPaymentIntent };
      });

      await cartRepository.clearCart(user.id);
      if (paymentIntent) {
        const eventsOrderItems = cart.items.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          priceAtPurchase: item.product.price,
        }));

        await eventPublisher.publish({
          eventId: randomUUID(),
          eventType: EventType.ORDER_CREATED,
          timestamp: new Date(),
          userId: user.id,
          data: {
            userEmail: user.email,
            userName: user.name,
            orderId: order.id,
            shippingAddress: address,
            totalAmount: Number(order.totalAmount),
            items: eventsOrderItems,
          },
        });
      }

      if (paymentIntent) {
        return {
          ...order,
          clientSecret: paymentIntent.clientSecret,
          paymentIntentId: paymentIntent.paymentIntentId,
        };
      }

      return order;
    } catch (error) {
      throw new Error(
        `Failed to create order: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getOrderById(orderId: string, user: ValidateUser) {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    if (user.role !== "admin" && order.userId !== user.id) {
      throw new Error("You don't have permission to view this order");
    }

    return order;
  }

  async getUserOrders(
    userId: string,
    options?: {
      status?: OrderStatus;
      limit?: number;
      offset?: number;
    }
  ) {
    const orders = await orderRepository.findByUserId(userId, options);

    const total = await orderRepository.countUserOrders(
      userId,
      options?.status
    );

    return {
      orders,
      pagination: {
        total,
        limit: options?.limit || 20,
        offset: options?.offset || 0,
        totalPages: Math.ceil(total / (options?.limit || 20)),
      },
    };
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    user: ValidateUser
  ) {
    const order = await orderRepository.findByIdMin(orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    if (
      status === "cancelled" &&
      ["shipped", "delivered"].includes(order.status)
    ) {
      throw new Error("Cannot cancel order that has been shipped or delivered");
    }

    if (status === "cancelled" && order.status !== "cancelled") {
      await Promise.all(
        order.orderItems.map((item) =>
          productRepository.updateStock(item.productId, item.quantity)
        )
      );
    }

    const updatedOrder = await orderRepository.updateStatus(orderId, status);

    if (updatedOrder.status === OrderStatus.cancelled) {
      await eventPublisher.publish({
        eventId: randomUUID(),
        eventType: EventType.ORDER_CANCELLED,
        timestamp: new Date(),
        userId: order.userId,
        data: {
          orderId: order.id,
          userEmail: user.email,
          userName: user.name,
        },
      });
    }
    return updatedOrder;
  }

  async getOrderSummary(user: ValidateUser) {
    const [totalOrders, pendingOrders, deliveredOrders] = await Promise.all([
      orderRepository.countUserOrders(user.id),
      orderRepository.countUserOrders(user.id, OrderStatus.pending),
      orderRepository.countUserOrders(user.id, OrderStatus.delivered),
    ]);

    return {
      totalOrders,
      pendingOrders,
      deliveredOrders,
    };
  }

  async listAllOrders(options: {
    status?: OrderStatus;
    userId?: string;
    limit: number;
    offset: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
  }) {
    const { status, userId, limit, offset, sortBy, sortOrder } = options;

    const orders = await orderRepository.listAllOrders({
      status,
      userId,
      limit,
      offset,
      sortBy,
      sortOrder,
    });

    // 2. Get the total count for pagination, applying the same filters
    const total = await orderRepository.countAllOrders({
      status,
      userId,
    });

    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    return {
      orders,
      pagination: {
        total,
        limit,
        offset,
        totalPages,
        currentPage,
      },
    };
  }

  async refundOrder(orderId: string, user: ValidateUser, amount?: number) {
    const order = await this.getOrderById(orderId, user);

    // Only admin can refund
    if (user.role !== "admin") {
      throw new Error("Only administrators can process refunds");
    }

    if (order.status === OrderStatus.refunded) {
      throw new Error("Order has already been refunded");
    }

    if (!order.stripePaymentIntentId) {
      throw new Error("Order has no payment to refund");
    }

    return await stripeService.refundPayment(orderId, amount);
  }
}

export default new OrderService();
