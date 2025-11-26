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

class ProductRepository {
  private toEventPayload(product: Product) {
    return {
      id: product.id,
      name: product.name,
      price: product.price.toString(),
      stock: product.stockQuantity,
      isActive: product.isActive,
      images: product.images,
      sku: product.sku,
      categoryId: product.categoryId,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }

  private async emitEvent(
    tx: Prisma.TransactionClient,
    eventType: ProductEventType,
    product: Product,
    extraData: Record<string, any> = {}
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
            include: { category: true },
          });

          await this.emitEvent(tx, ProductEventType.CREATED, product);

          return product;
        });
      },
      { model: "Product", operation: "create", field: "sku" }
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
            include: { category: true },
          });

          await this.emitEvent(tx, ProductEventType.UPDATED, product);

          return product;
        });
      },
      { model: "Product", operation: "update", field: "sku" }
    );
  }

  async delete(id: string) {
    return await safeQuery(
      async () => {
        return await prisma.$transaction(async (tx) => {
          const product = await tx.product.delete({ where: { id } });

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

          return product;
        });
      },
      { model: "Product", operation: "delete" }
    );
  }

  async updateStock(
    id: string,
    quantity: number,
    tx?: Prisma.TransactionClient
  ) {
    return await safeQuery(
      async () => {
        const transaction = async (db: Prisma.TransactionClient) => {
          const product = await db.product.update({
            where: { id },
            data: { stockQuantity: { increment: quantity } },
          });

          await this.emitEvent(db, ProductEventType.STOCK_CHANGED, product, {
            previousStock: product.stockQuantity - quantity,
          });

          return product;
        };

        if (tx) return transaction(tx);
        return await prisma.$transaction(transaction);
      },
      { model: "Product", operation: "updateStock" }
    );
  }

  async addImage(id: string, images: string[]) {
    return await safeQuery(
      async () => {
        return await prisma.$transaction(async (tx) => {
          const product = await tx.product.update({
            where: { id },
            data: { images: { push: images } },
          });

          await this.emitEvent(tx, ProductEventType.UPDATED, product);

          return product;
        });
      },
      { model: "Product", operation: "addImage" }
    );
  }

  async reorderImages(productId: string, newOrderKeys: string[]) {
    return await safeQuery(
      async () => {
        return await prisma.$transaction(async (tx) => {
          const product = await tx.product.findUniqueOrThrow({
            where: { id: productId },
          });

          const currentSet = new Set(product.images);
          const newSet = new Set(newOrderKeys);
          if (
            currentSet.size !== newSet.size ||
            ![...currentSet].every((k) => newSet.has(k))
          ) {
            throw new BadRequestError("Image mismatch during reorder");
          }

          const updatedProduct = await tx.product.update({
            where: { id: productId },
            data: { images: newOrderKeys },
          });

          await this.emitEvent(tx, ProductEventType.UPDATED, updatedProduct);

          return updatedProduct;
        });
      },
      { model: "Product", operation: "reorderImages" }
    );
  }

  async findbyId(id: string) {
    return await safeQuery(
      () =>
        prisma.product.findUniqueOrThrow({
          where: { id },

          include: { category: true },
        }),
      { model: "Product", operation: "find" }
    );
  }

  async findByIds(ids: string[]) {
    return await safeQuery(
      () =>
        prisma.product.findMany({
          where: { id: { in: ids } },

          include: { category: true },
        }),
      { model: "Product", operation: "findByIds" }
    );
  }

  async findMany(filters: ListProductQuery) {
    return await safeQuery(
      async () => {
        const {
          page = 1,
          limit = 20,
          search,
          inStock,
          minPrice,
          maxPrice,
          categoryId,
        } = filters;

        const skip = (page - 1) * limit;
        const where: Prisma.ProductWhereInput = {
          ...(search && {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { sku: { contains: search, mode: "insensitive" } },
            ],
          }),
          ...(minPrice && { price: { gte: minPrice } }),
          ...(maxPrice && { price: { lte: maxPrice } }),
          ...(inStock !== undefined && {
            stockQuantity: inStock ? { gt: 0 } : { equals: 0 },
          }),
          ...(categoryId && { categoryId }),
        };

        const [products, total] = await Promise.all([
          prisma.product.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: { category: true },
          }),
          prisma.product.count({ where }),
        ]);
        return {
          products,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        };
      },
      { model: "Product", operation: "list" }
    );
  }
}

export default new ProductRepository();
