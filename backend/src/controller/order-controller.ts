import { Request, Response } from "express";
import orderService from "../service/order-service";
import { OrderStatus } from "../../generated/prisma/client";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  listOrdersSchema,
  listAdminOrdersSchema,
  refundOrderSchema,
} from "../lib/order-validation";
import stripeService from "../service/stripe-service";

class OrderController {
  async createOrder(req: Request, res: Response) {
    try {
      const { error, value } = createOrderSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        return res.status(400).json({
          error: error.details.map((detail) => ({
            field: detail.path[0],
            message: detail.message,
          })),
        });
      }

      const order = await orderService.createOrderFromCart(
        req.user,
        value.shippingAddressId,
        value.paymentMethod
      );

      res.status(201).json({
        message: "Order created successfully",
        order,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getOrder(req: Request, res: Response) {
    try {
      const order = await orderService.getOrderById(req.params.id, req.user);

      res.status(200).json({ order });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getUserOrders(req: Request, res: Response) {
    try {
      const { error, value } = listOrdersSchema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        return res.status(400).json({
          error: error.details.map((detail) => ({
            field: detail.path[0],
            message: detail.message,
          })),
        });
      }

      const { page = 1, limit = 20, status } = value;
      const offset = (page - 1) * limit;

      const result = await orderService.getUserOrders(req.user.id, {
        status: status as OrderStatus | undefined,
        limit,
        offset,
      });

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async listAllOrdersAdmin(req: Request, res: Response) {
    try {
      const { error, value } = listAdminOrdersSchema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        return res.status(400).json({
          error: error.details.map((detail) => ({
            field: detail.path[0],
            message: detail.message,
          })),
        });
      }

      const { page, limit, status, userId, sortBy, sortOrder } = value;
      const offset = (page - 1) * limit;

      const result = await orderService.listAllOrders({
        status: status as OrderStatus | undefined,
        userId,
        limit,
        offset,
        sortBy,
        sortOrder,
      });

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateOrderStatus(req: Request, res: Response) {
    try {
      const { error, value } = updateOrderStatusSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        return res.status(400).json({
          error: error.details.map((detail) => ({
            field: detail.path[0],
            message: detail.message,
          })),
        });
      }

      const order = await orderService.updateOrderStatus(
        req.params.id,
        value.status as OrderStatus,
        req.user
      );

      res.status(200).json({
        message: `Order status updated to ${value.status}`,
        order,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async cancelOrder(req: Request, res: Response) {
    try {
      const order = await orderService.getOrderById(req.params.id, req.user);

      if (order.userId !== req.user.id && req.user.role !== "admin") {
        return res
          .status(403)
          .json({ error: "You can only cancel your own orders" });
      }

      if (order.status !== "pending") {
        return res.status(400).json({
          error: `Cannot cancel order with status: ${order.status}`,
        });
      }

      const updatedOrder = await orderService.updateOrderStatus(
        req.params.id,
        OrderStatus.cancelled,
        req.user
      );

      res.status(200).json({
        message: "Order cancelled successfully",
        order: updatedOrder,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getOrderSummary(req: Request, res: Response) {
    try {
      const summary = await orderService.getOrderSummary(req.user);

      res.status(200).json(summary);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async handleStripeWebhook(req: Request, res: Response) {
    const signature = req.headers["stripe-signature"];

    if (!signature) {
      return res.status(400).json({ error: "No signature provided" });
    }

    try {
      await stripeService.handleWebhook(
        signature as string,
        req.body // Raw body buffer
      );

      res.json({ received: true });
    } catch (error) {
      console.log("Webhook error", { error });
      return res.status(400).json({
        error: error instanceof Error ? error.message : "Webhook failed",
      });
    }
  }

  async refundOrder(req: Request, res: Response) {
    try {
      const { error, value } = refundOrderSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        return res.status(400).json({
          error: error.details.map((detail) => ({
            field: detail.path[0],
            message: detail.message,
          })),
        });
      }

      const refund = await orderService.refundOrder(
        req.params.id,
        req.user,
        value.amount
      );

      res.status(200).json({
        message: "Refund processed successfully",
        refund,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export default new OrderController();
