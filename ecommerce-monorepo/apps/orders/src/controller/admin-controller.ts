import { Request, Response } from "express";
import {
  BadRequestError,
  OrderStatus,
  sendSuccess,
  validateAndThrow,
} from "@ecommerce/common";
import { adminOrderService } from "../services/admin-order-service";
import {
  listAdminOrdersSchema,
  ListOrderInput,
} from "../lib/order-validation-schema";

class AdminController {
  async listAllOrdersAdmin(req: Request, res: Response) {
    const filters = validateAndThrow<ListOrderInput>(
      listAdminOrdersSchema,
      req.query,
    );
    const result = await adminOrderService.listAllOrders({
      ...filters,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

    return sendSuccess(res, result);
  }

  async updateOrderStatus(req: Request, res: Response) {
    const { status } = req.body;

    if (!Object.values(OrderStatus).includes(status)) {
      throw new BadRequestError("Invalid order status");
    }

    const order = await adminOrderService.updateOrderStatus(
      req.params.id,
      status as OrderStatus,
    );

    return sendSuccess(res, order);
  }

  async cancelOrder(req: Request, res: Response) {
    const updatedOrder = await adminOrderService.updateOrderStatus(
      req.params.id,
      OrderStatus.CANCELLED,
    );

    return sendSuccess(res, updatedOrder, "Order cancelled successfully");
  }

  async refundOrder(req: Request, res: Response) {
    const updatedOrder = await adminOrderService.refundOrder(req.params.id);

    return sendSuccess(res, updatedOrder, "Order refunded successfully");
  }
}

export const adminController = new AdminController();
