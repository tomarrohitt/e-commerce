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
    },
    paymentId: null,
  ) {
    const {
      userId,
      userEmail,
      userName,
      totalAmount,
      shippingAddress,
      billingAddress,
      items,
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
            include: { items: true, shippingAddress: true },
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
      { model: "Order", operation: "create" },
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
      { model: "Order", operation: "findById" },
    );
  }

  async findByUserId(
    userId: string,
    options: { status?: OrderStatus; limit: number; offset: number },
  ) {
    const { status, limit, offset } = options;
    return await safeQuery(
      () =>
        prisma.order.findMany({
          where: { userId, ...(status && { status }) },
          include: { items: true },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        }),
      { model: "Order", operation: "findByUserId" },
    );
  }

  async countUserOrders(userId: string, status?: OrderStatus) {
    return await safeQuery(
      () =>
        prisma.order.count({
          where: { userId, ...(status && { status }) },
        }),
      { model: "Order", operation: "countUserOrders" },
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

    return { orders, total };
  }

  async updateStatus(id: string, status: OrderStatus, reason?: string) {
    return await safeQuery(
      async () => {
        return await prisma.$transaction(async (tx) => {
          const order = await tx.order.update({
            where: { id },
            data: { status },
            include: { items: true },
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
          return order;
        });
      },
      { model: "Order", operation: "updateStatus" },
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
      { model: "Order", operation: "updateStatus" },
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
      { model: "Order", operation: "findByPaymentIntent" },
    );
  }
}

export const orderRepository = new OrderRepository();
