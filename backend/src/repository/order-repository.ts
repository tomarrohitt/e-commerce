import { stat } from "fs";
import { OrderStatus, Prisma } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { safeQuery } from "../middleware/prisma-error-middleware";

class OrderRepository {
  async create(data: {
    userId: string;
    totalAmount: number;
    shippingAddressId: string;
    items: {
      productId: string;
      quantity: number;
      priceAtPurchase: number;
    }[];
  }) {
    return await safeQuery(
      () =>
        prisma.order.create({
          data: {
            userId: data.userId,
            totalAmount: data.totalAmount,
            shippingAddressId: data.shippingAddressId,
            status: OrderStatus.pending,
            orderItems: {
              create: data.items,
            },
          },
          include: {
            orderItems: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: true,
                  },
                },
              },
            },
            shippingAddress: true,
          },
        }),

      { model: "Order", operation: "create" }
    );
  }

  async findById(id: string) {
    return await safeQuery(
      () =>
        prisma.order.findUnique({
          where: { id },
          include: {
            orderItems: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: true,
                  },
                },
              },
            },
            shippingAddress: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
      { model: "Order", operation: "findById" }
    );
  }

  async findByUserId(
    userId: string,
    options?: { status?: OrderStatus; limit?: number; offset?: number }
  ) {
    const { status, limit = 20, offset = 0 } = options || {};
    return await safeQuery(
      () =>
        prisma.order.findMany({
          where: { userId, ...(status && { status }) },
          include: {
            orderItems: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: true,
                  },
                },
              },
            },
            shippingAddress: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: limit,
          skip: offset,
        }),
      { model: "Order", operation: "findByUserId" }
    );
  }

  async updateStatus(id: string, status: OrderStatus) {
    return await safeQuery(
      () =>
        prisma.order.update({
          where: { id },
          data: { status, updatedAt: new Date() },
        }),
      { model: "Order", operation: "updateStatus" }
    );
  }

  async updatePaymentIntentId(id: string, paymentIntentId: string) {
    return await safeQuery(
      () =>
        prisma.order.update({
          where: { id },
          data: {
            stripePaymentIntentId: paymentIntentId,
            paymentMethod: "stripe",
          },
        }),
      { model: "Order", operation: "updatePaymentIntentId" }
    );
  }

  async findByPaymentIntent(paymentIntentId: string) {
    return await safeQuery(
      () =>
        prisma.order.findFirst({
          where: { stripePaymentIntentId: paymentIntentId },
          include: {
            orderItems: {
              include: {
                product: true,
              },
            },
          },
        }),
      { model: "Order", operation: "findByPaymentIntentId" }
    );
  }

  async countUserOrders(userId: string, status?: OrderStatus) {
    return await safeQuery(
      () =>
        prisma.order.count({
          where: { userId, ...(status && { status }) },
        }),
      { model: "Order", operation: "countUserOrders" }
    );
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

    const where: Prisma.OrderWhereInput = {};
    if (status) {
      where.status = status;
    }
    if (userId) {
      where.userId = userId;
    }

    const orderBy: Prisma.OrderOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    return await safeQuery(
      () =>
        prisma.order.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            orderItems: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: true,
                  },
                },
              },
            },
            shippingAddress: true,
          },
          orderBy,
          take: limit,
          skip: offset,
        }),
      { model: "Order", operation: "listAllOrders" }
    );
  }

  async countAllOrders(options: { status?: OrderStatus; userId?: string }) {
    const { status, userId } = options;

    const where: Prisma.OrderWhereInput = {};
    if (status) {
      where.status = status;
    }
    if (userId) {
      where.userId = userId;
    }

    return await safeQuery(
      () =>
        prisma.order.count({
          where,
        }),
      { model: "Order", operation: "countAllOrders" }
    );
  }
}

export default new OrderRepository();
