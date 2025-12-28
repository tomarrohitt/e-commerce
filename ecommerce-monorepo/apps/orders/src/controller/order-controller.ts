import { Request, Response } from "express";
import {
  validateAndThrow,
  BadRequestError,
  sendSuccess,
  LoggerFactory,
  OrderEventType,
  sendCreated,
} from "@ecommerce/common";
import { orderService } from "../services/order-service";
import { OrderStatus } from "@prisma/client";
import {
  CreateOrderInput,
  createOrderSchema,
} from "../lib/order-validation-schema";
import { orderRepository } from "../repository/order-repository";
import { stripeService } from "../services/stripe-service";
import { prisma } from "../config/prisma";

const logger = LoggerFactory.create("OrderService");

class OrderController {
  async createOrder(req: Request, res: Response) {
    const input = validateAndThrow<CreateOrderInput>(
      createOrderSchema,
      req.body
    );

    const user = {
      userId: req.user.id,
      userEmail: req.user.email,
      userName: req.user.name,
    };

    const result = await orderService.createOrder({ ...input, ...user });

    return sendCreated(res, result, "Order created successfully");
  }

  async getOrder(req: Request, res: Response) {
    const order = await orderService.getOrderById(req.params.id, req.user.id);

    return sendSuccess(res, order);
  }

  async getUserOrders(req: Request, res: Response) {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const status = req.query.status as OrderStatus | undefined;

    const result = await orderService.getUserOrders(req.user.id, {
      page,
      limit,
      status,
    });

    return sendSuccess(res, result);
  }

  // POST /api/orders/:id/cancel
  async cancelOrder(req: Request, res: Response) {
    const updatedOrder = await orderService.cancelOrder(
      req.params.id,
      req.user
    );

    return sendSuccess(res, updatedOrder, "Order cancelled successfully");
  }

  async getOrderSummary(req: Request, res: Response) {
    const summary = await orderService.getOrderSummary(req.user.id);
    return sendSuccess(res, summary);
  }

  async handleStripeWebhook(req: Request, res: Response) {
    const sig = req.headers["stripe-signature"] as string;

    if (!sig) {
      throw new BadRequestError("No signature provided");
    }

    try {
      const event = stripeService.constructEvent(req.body, sig);
      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object as any;
        const paymentId = paymentIntent.id;
        const orderId = paymentIntent.metadata.orderId;
        const order = await orderRepository.findById(orderId);

        if (order) {
          if (order.status === OrderStatus.CANCELLED) {
            await prisma.$transaction(async (tx) => {
              await tx.order.update({
                where: { id: order.id },
                data: { status: OrderStatus.REFUNDED, refunded: true },
              });
              await stripeService.refundPayment(paymentId);
            });
          } else {
            await prisma.$transaction(async (tx) => {
              await tx.order.update({
                where: { id: order.id },
                data: { status: OrderStatus.PAID, paid: true },
              });

              await tx.outboxEvent.create({
                data: {
                  aggregateId: order.id,
                  eventType: OrderEventType.PAID,
                  payload: {
                    orderId: order.id,
                    userId: order.userId,
                    userEmail: order.userEmail,
                    userName: order.userName,
                    totalAmount: Number(order.totalAmount),
                    paymentId: paymentId,
                    items: order.items.map((item) => ({
                      productId: item.productId,
                      name: item.name,
                      price: Number(item.price),
                      quantity: item.quantity,
                    })),
                    shippingAddress: order.shippingAddress,
                    billingAddress: order.billingAddress,
                    createdAt: new Date().toISOString(),
                  },
                },
              });
            });
            return sendSuccess(res, { received: true });
          }
        } else {
          logger.error(
            `[Stripe] ❌ No order found for Payment ID: ${paymentId}`
          );
        }
      }

      return sendSuccess(res, { received: true });
    } catch (err: any) {
      logger.error(`Webhook Error: ${err.message}`);
      if (err.message.includes("signature")) {
        throw new BadRequestError(`Webhook Error: ${err.message}`);
      }
      throw err;
    }
  }

  async getPaymentStatus(req: Request, res: Response) {
    const orderId = req.params.id;
    const id = req.user.id;

    const status = await orderService.getPaymentStatus(orderId, id);

    return sendSuccess(res, status);
  }
}

export const orderController = new OrderController();
