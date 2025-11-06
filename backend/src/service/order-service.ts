// service/order-service.ts
import addressRepository from "../repository/address-repository";
import cartRepository from "../repository/cart-repository";
import orderRepository from "../repository/order-repository";
import productRepository from "../repository/product-repository";
import cartService from "./cart-service";
import { ValidateUser } from "../types";
import { getSecureWhere } from "../utils/get-where";
import { OrderStatus } from "../../generated/prisma/client";

class OrderService {
  async createOrderFromCart(user: ValidateUser, shippingAddressId: string) {
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
      priceAtPurchase: item.product.price, // Lock price at order time
    }));

    const totalAmount = cart.totalPrice;

    try {
      const order = await orderRepository.create({
        userId: user.id,
        totalAmount,
        shippingAddressId,
        items: orderItems,
      });

      await Promise.all(
        orderItems.map((item) =>
          productRepository.updateStock(item.productId, -item.quantity)
        )
      );

      await cartRepository.clearCart(user.id);

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

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = await orderRepository.findById(orderId);

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

    return await orderRepository.updateStatus(orderId, status);
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
    userId?: string; // Filter by user
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
}

export default new OrderService();
