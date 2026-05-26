import { OrderStatus } from "@prisma/client";
import { orderRepository } from "../repository/order-repository";
import { stripeService } from "./stripe-service";
import { NotFoundError, BadRequestError } from "@ecommerce/common";
import { ListOrderInput } from "../lib/order-validation-schema";

class AdminOrderService {
  async listAllOrders(options: ListOrderInput) {
    const offset = (options.page - 1) * options.limit;

    const data = await orderRepository.findAll({
      ...options,
      offset,
    });

    return data;
  }

  async getOrderById(orderId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError("Order not found");
    return order;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError("Order not found");

    return await orderRepository.updateStatus(orderId, status);
  }

  async refundOrder(orderId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new BadRequestError("Order not found");
    if (!order.paymentId) throw new BadRequestError("No payment to refund");

    if (order.status === OrderStatus.REFUNDED) {
      throw new BadRequestError("Order already refunded");
    }

    try {
      await stripeService.refundPayment(order.paymentId);
    } catch (error: any) {
      if (
        error.code === "charge_not_found" ||
        error.type === "StripeInvalidRequestError"
      ) {
        await stripeService.cancelPaymentIntent(order.paymentId);
      } else {
        throw error;
      }
    }

    return await orderRepository.updateStatus(orderId, OrderStatus.REFUNDED);
  }
}

export const adminOrderService = new AdminOrderService();
