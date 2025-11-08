import { Request, Response } from "express";
import orderService from "../service/order-service";
import { OrderStatus } from "../../generated/prisma/client";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  listOrdersSchema,
  listAdminOrdersSchema,
} from "../lib/order-validation";

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
        {
          id: req.user.id,
          role: req.user.role!,
        },
        value.shippingAddressId
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
      const order = await orderService.getOrderById(req.params.id, {
        id: req.user.id,
        role: req.user.role!,
      });

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
        value.status as OrderStatus
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
      const order = await orderService.getOrderById(req.params.id, {
        id: req.user.id,
        role: req.user.role!,
      });

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
        OrderStatus.cancelled
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
      const summary = await orderService.getOrderSummary({
        id: req.user.id,
        role: req.user.role!,
      });

      res.status(200).json(summary);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export default new OrderController();
