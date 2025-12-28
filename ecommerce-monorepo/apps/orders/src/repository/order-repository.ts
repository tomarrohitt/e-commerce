import { prisma } from "../config/prisma";
import { safeQuery, OrderEventType } from "@ecommerce/common";
import { OrderStatus, Prisma } from "@prisma/client";
import { CreateOrderInput } from "../lib/order-validation-schema";

class OrderRepository {
  async create(
    input: CreateOrderInput & {
      userId: string;
      userEmail: string;
      userName: string;
      subtotal: number;
      tax: number;
    },
    paymentId: null
  ) {
    const {
      userId,
      userEmail,
      userName,
      totalAmount,
      shippingAddress,
      billingAddress,
      items,
      subtotal,
      tax,
    } = input;
    return await safeQuery(
      async () => {
        return await prisma.$transaction(async (tx) => {
          const order = await tx.order.create({
            data: {
              userId,
              userEmail,
              userName,
              totalAmount,
              tax,
              subtotal,
              status: OrderStatus.CREATED,
              paymentId,
              shippingAddress: { create: shippingAddress },
              billingAddress: { create: billingAddress || shippingAddress },
              items: {
                create: items.map((item) => ({
                  ...item,
                })),
              },
            },
            select: {
              id: true,
              totalAmount: true,
              status: true,
              items: true,
              shippingAddress: true,
            },
          });

          await tx.outboxEvent.create({
            data: {
              eventType: OrderEventType.CREATED,
              aggregateId: order.id,
              payload: {
                orderId: order.id,
                userId,
                userEmail,
                userName,
                totalAmount: Number(order.totalAmount),
                status: order.status,
                items: items.map((item) => ({
                  ...item,
                  price: Number(item.price),
                })),
                shippingAddress: shippingAddress,
              },
            },
          });

          return order;
        });
      },
      { model: "Order", operation: "create" }
    );
  }

  async findById(id: string) {
    return await safeQuery(
      () =>
        prisma.order.findUnique({
          where: { id },
          include: {
            items: true,
            shippingAddress: true,
            billingAddress: true,
          },
        }),
      { model: "Order", operation: "findById" }
    );
  }

  async findByUserId(
    userId: string,
    options: { status?: OrderStatus; limit: number; offset: number }
  ) {
    const { status, limit, offset } = options;

    return await safeQuery(
      async () => {
        const where: Prisma.OrderWhereInput = {
          userId,
          ...(status && { status }),
        };

        const [orders, total] = await Promise.all([
          prisma.order.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: offset,
            select: {
              id: true,
              totalAmount: true,
              status: true,
              currency: true,
              invoiceUrl: true,
              createdAt: true,

              items: {
                select: {
                  productId: true,
                  name: true,
                  price: true,
                  thumbnail: true,
                  quantity: true,
                },
              },

              shippingAddress: {
                select: {
                  street: true,
                  city: true,
                  state: true,
                  zipCode: true,
                  country: true,
                  phoneNumber: true,
                },
              },
            },
          }),
          prisma.order.count({ where }),
        ]);

        return {
          orders,
          pagination: {
            total,
            limit,
            page: Math.floor(offset / limit) + 1,
            totalPages: Math.ceil(total / limit),
            hasNextPage: offset + limit < total,
            hasPrevPage: offset > 0,
          },
        };
      },
      { model: "Order", operation: "findByUserId" }
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

  async findAll(options: {
    status?: OrderStatus;
    userId?: string;
    limit: number;
    offset: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
  }) {
    const { status, userId, limit, offset, sortBy, sortOrder } = options;

    const where: Prisma.OrderWhereInput = {
      ...(status && { status }),
      ...(userId && { userId }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true, shippingAddress: true },
        orderBy: { [sortBy]: sortOrder },
        take: limit,
        skip: offset,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        total,
        limit,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit),
        hasNextPage: offset + limit < total,
        hasPrevPage: offset > 0,
      },
    };
  }

  async updateStatus(id: string, status: OrderStatus, reason?: string) {
    return await safeQuery(
      async () => {
        return await prisma.$transaction(async (tx) => {
          const order = await tx.order.update({
            where: { id },
            data: { status },
            select: {
              id: true,
              userId: true,
              userEmail: true,
              userName: true,
              totalAmount: true,
              status: true,
              items: {
                select: {
                  productId: true,
                  quantity: true,
                },
              },
              paymentId: true,
            },
          });

          if (status === OrderStatus.CANCELLED) {
            await tx.outboxEvent.create({
              data: {
                eventType: OrderEventType.CANCELLED,
                aggregateId: order.id,
                payload: {
                  orderId: order.id,
                  userId: order.userId,
                  userName: order.userName,
                  userEmail: order.userEmail,
                  paymentId: order.paymentId,
                  items: order.items.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                  })),
                  reason: reason,
                },
              },
            });
          }
          if (status === OrderStatus.DELIVERED) {
            await tx.outboxEvent.create({
              data: {
                eventType: OrderEventType.DELIVERED,
                aggregateId: order.id,
                payload: {
                  userId: order.userId,
                  items: order.items.map((item) => ({
                    productId: item.productId,
                  })),
                },
              },
            });
          }
          return order;
        });
      },
      { model: "Order", operation: "updateStatus" }
    );
  }
  async updateInvoiceUrl(id: string, invoiceUrl: string) {
    return await safeQuery(
      async () => {
        return await prisma.$transaction(async (tx) => {
          const order = await tx.order.update({
            where: { id },
            data: { invoiceUrl },
          });
        });
      },
      { model: "Order", operation: "updateStatus" }
    );
  }
  async findByPaymentIntent(paymentId: string) {
    return await safeQuery(
      () =>
        prisma.order.findFirst({
          where: {
            paymentId: paymentId,
          },
          include: { items: true, shippingAddress: true, billingAddress: true },
        }),
      { model: "Order", operation: "findByPaymentIntent" }
    );
  }
}

export const orderRepository = new OrderRepository();
