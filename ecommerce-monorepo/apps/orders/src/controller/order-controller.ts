import { Request, Response } from "express";
import {
  validateAndThrow,
  BadRequestError,
  sendSuccess,
} from "@ecommerce/common";
import { orderService } from "../services/order-service";
import { OrderStatus } from "@prisma/client";
import {
  CreateOrderInput,
  createOrderSchema,
} from "../lib/order-validation-schema";
import { orderRepository } from "../repository/order-repository";
import { stripeService } from "../services/stripe-service";

class OrderController {
  // POST /api/orders
  async createOrder(req: Request, res: Response) {
    const input = validateAndThrow<CreateOrderInput>(
      createOrderSchema,
      req.body,
    );

    const user = {
      id: req.user.id,
      email: req.user.email,
    };

    const result = await orderService.createOrder(user, input);

    return sendSuccess(
      res,
      {
        message: "Order created successfully",
        data: result,
      },
      201,
    );
  }

  // GET /api/orders/:id
  async getOrder(req: Request, res: Response) {
    const order = await orderService.getOrderById(req.params.id, req.user.id);

    return sendSuccess(res, order);
  }

  // GET /api/orders
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
      req.user.id,
    );

    return sendSuccess(res, {
      message: "Order cancelled successfully",
      order: updatedOrder,
    });
  }

  // GET /api/orders/summary
  async getOrderSummary(req: Request, res: Response) {
    const summary = await orderService.getOrderSummary(req.user.id);
    return sendSuccess(res, summary);
  }

  // POST /api/orders/webhook
  // Note: We keep some logic here because Webhooks are technically an "Entry Point" adapter
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

        console.log(`[Stripe] Payment Succeeded: ${paymentId}`);

        const order = await orderRepository.findByPaymentIntent(paymentId);

        if (order) {
          if (order.status === OrderStatus.CANCELLED) {
            console.log(
              `[Stripe] Order ${order.id} was cancelled. Refunding...`,
            );
            await stripeService.refundPayment(paymentId);
            await orderRepository.updateStatus(order.id, OrderStatus.REFUNDED);
          } else {
            console.log(`[Stripe] Marking Order ${order.id} as PAID`);
            await orderRepository.updateStatus(order.id, OrderStatus.PAID);
          }
        } else {
          console.error(
            `[Stripe] ❌ No order found for Payment ID: ${paymentId}`,
          );
        }
      }

      // Respond to Stripe immediately
      return sendSuccess(res, { received: true });
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      throw new BadRequestError(`Webhook Error: ${err.message}`);
    }
  }

  // GET /api/orders/:id/payment-status
  async getPaymentStatus(req: Request, res: Response) {
    const orderId = req.params.id;
    const id = req.user.id;

    const status = await orderService.getPaymentStatus(orderId, id);

    return sendSuccess(res, status);
  }
}

export const orderController = new OrderController();
