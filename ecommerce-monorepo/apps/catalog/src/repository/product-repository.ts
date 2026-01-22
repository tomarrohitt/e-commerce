import { Prisma, Product } from "@prisma/client";
import { prisma } from "../config/prisma";
import {
  safeQuery,
  BadRequestError,
  ProductEventType,
} from "@ecommerce/common";
import {
  CreateProductInput,
  ListProductQuery,
  UpdateProductInput,
} from "../lib/validation-schema";

const EVENT_SELECT = {
  id: true,
  name: true,
  price: true,
  stockQuantity: true,
  thumbnail: true,
  isActive: true,
} satisfies Prisma.ProductSelect;

type SortBy = "createdAt" | "price" | "rating";

const orderByMap: Record<
  NonNullable<SortBy>,
  Prisma.ProductOrderByWithRelationInput
> = {
  createdAt: { createdAt: "desc" },
  price: { price: "asc" },
  rating: { rating: "desc" },
};

type ProductEventPayload = Prisma.ProductGetPayload<{
  select: typeof EVENT_SELECT;
}>;

class ProductRepository {
  private toEventPayload(product: ProductEventPayload) {
    return {
      id: product.id,
      name: product.name,
      price: product.price.toString(),
      stockQuantity: product.stockQuantity,
      thumbnail: product.thumbnail ?? undefined,
      isActive: product.isActive,
    };
  }

  private async emitEvent(
    tx: Prisma.TransactionClient,
    eventType: ProductEventType,
    product: ProductEventPayload,
    extraData: Record<string, any> = {},
  ) {
    await tx.outboxEvent.create({
      data: {
        eventType,
        aggregateId: product.id,
        payload: {
          ...this.toEventPayload(product),
          ...extraData,
        },
      },
    });
  }

  async create(data: CreateProductInput) {
    return await safeQuery(
      async () => {
        return await prisma.$transaction(async (tx) => {
          const product = await tx.product.create({
            data,
            select: EVENT_SELECT,
          });

          await this.emitEvent(tx, ProductEventType.CREATED, product);
          return { id: product.id };
        });
      },
      { model: "Product", operation: "create", field: "sku" },
    );
  }

  async update(id: string, data: UpdateProductInput) {
    const { stockQuantity, ...safeData } = data;
    if (stockQuantity !== undefined) {
      throw new BadRequestError("Use /stock endpoint for stock updates");
    }

    return await safeQuery(
      async () => {
        return await prisma.$transaction(async (tx) => {
          const product = await tx.product.update({
            where: { id },
            data: safeData,
            select: EVENT_SELECT,
          });

          await this.emitEvent(tx, ProductEventType.UPDATED, product);

          return { id };
        });
      },
      { model: "Product", operation: "update", field: "sku" },
    );
  }

  async delete(id: string) {
    return await safeQuery(
      async () => {
        return await prisma.$transaction(async (tx) => {
          const product = await tx.product.deleteMany({
            where: { id },
          });

          await tx.outboxEvent.create({
            data: {
              eventType: ProductEventType.DELETED,
              aggregateId: id,
              payload: {
                id,
                deletedAt: new Date().toISOString(),
              },
            },
          });

          return { id };
        });
      },
      { model: "Product", operation: "delete" },
    );
  }

  async updateStock(
    id: string,
    quantity: number,
    tx?: Prisma.TransactionClient,
  ) {
    return await safeQuery(
      async () => {
        const transaction = async (db: Prisma.TransactionClient) => {
          const product = await db.product.update({
            where: { id },
            data: { stockQuantity: { increment: quantity } },
            select: EVENT_SELECT,
          });

          await this.emitEvent(db, ProductEventType.STOCK_CHANGED, product, {
            previousStock: product.stockQuantity - quantity,
          });
          return product;
        };

        if (tx) return transaction(tx);
        return await prisma.$transaction(transaction);
      },
      { model: "Product", operation: "updateStock" },
    );
  }

  async addImage(id: string, images: string[]) {
    return await safeQuery(
      async () => {
        return await prisma.$transaction(async (tx) => {
          const product = await tx.product.update({
            where: { id },
            data: { images: { push: images } },
            select: EVENT_SELECT,
          });
          return product;
        });
      },
      { model: "Product", operation: "addImage" },
    );
  }

  async reorderImages(productId: string, newOrderKeys: string[]) {
    return await safeQuery(
      async () => {
        return await prisma.$transaction(async (tx) => {
          const current = await tx.product.findUniqueOrThrow({
            where: { id: productId },
            select: { images: true },
          });

          const currentSet = new Set(current.images);
          const newSet = new Set(newOrderKeys);
          if (
            currentSet.size !== newSet.size ||
            ![...currentSet].every((k) => newSet.has(k))
          ) {
            throw new BadRequestError("Image mismatch during reorder");
          }

          const product = await tx.product.update({
            where: { id: productId },
            data: { images: newOrderKeys },
            select: EVENT_SELECT,
          });
          return product;
        });
      },
      { model: "Product", operation: "reorderImages" },
    );
  }

  async findbyId(id: string) {
    return await safeQuery(
      () =>
        prisma.product.findUniqueOrThrow({
          where: { id },
          include: {
            category: {
              select: {
                name: true,
                slug: true,
                attributeSchema: true,
              },
            },
          },
        }),
      { model: "Product", operation: "find" },
    );
  }

  async findByIds(ids: string[]) {
    return await safeQuery(
      () =>
        prisma.product.findMany({
          where: { id: { in: ids } },
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            stockQuantity: true,
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        }),
      { model: "Product", operation: "findByIds" },
    );
  }

  async findMany(filters: ListProductQuery) {
    return await safeQuery(
      async () => {
        const {
          page,
          limit,
          search,
          inStock,
          minPrice,
          maxPrice,
          categoryId,
          sortBy,
          sortOrder,
        } = filters;

        const skip = (page - 1) * limit;
        const orderBy: Prisma.ProductOrderByWithRelationInput = sortBy
          ? { [sortBy]: sortOrder ?? "desc" }
          : { createdAt: "desc" };
        const priceFilter =
          minPrice !== undefined || maxPrice !== undefined
            ? {
                price: {
                  ...(minPrice !== undefined && { gte: minPrice }),
                  ...(maxPrice !== undefined && { lte: maxPrice }),
                },
              }
            : {};

        const where: Prisma.ProductWhereInput = {
          ...(search && {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { sku: { contains: search, mode: "insensitive" } },
            ],
          }),

          ...priceFilter,

          ...(inStock !== undefined && {
            stockQuantity: inStock ? { gt: 0 } : { equals: 0 },
          }),

          ...(categoryId && { categoryId }),
        };

        const [products, total] = await prisma.$transaction([
          prisma.product.findMany({
            where,
            skip,
            take: limit,
            orderBy,
            select: {
              id: true,
              name: true,
              price: true,
              thumbnail: true,
              stockQuantity: true,
              category: {
                select: {
                  name: true,
                  slug: true,
                },
              },
            },
          }),
          prisma.product.count({ where }),
        ]);
        return {
          products,
          pagination: {
            total,
            page: Math.floor(skip / limit) + 1,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNextPage: skip + limit < total,
            hasPrevPage: skip > 0,
          },
        };
      },

      { model: "Product", operation: "list" },
    );
  }
}

export default new ProductRepository();
