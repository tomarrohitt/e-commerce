import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import {
  DatabaseError,
  safeQuery,
} from "../middleware/prisma-error-middleware";
import { ProductFilterType } from "../types";

class ProductRepository {
  async create(data: Prisma.ProductCreateInput) {
    return await safeQuery(
      () =>
        prisma.product.create({
          data,
          include: {
            category: true,
          },
        }),
      { model: "Product", operation: "create" }
    );
  }

  async findbyId(id: string) {
    return await safeQuery(
      () =>
        prisma.product.findUnique({
          where: { id },
          include: {
            category: true,
          },
        }),
      { model: "Product", id, operation: "find" }
    );
  }

  async findByIds(ids: string[]) {
    return await safeQuery(
      () =>
        prisma.product.findMany({
          where: {
            id: {
              in: ids,
            },
          },
          include: {
            category: true,
          },
        }),
      { model: "Product", operation: "findbyIds" }
    );
  }

  async findMany(filters: ProductFilterType) {
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
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            sku: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }),
      ...(minPrice && {
        price: {
          gte: minPrice,
        },
      }),
      ...(maxPrice && {
        price: {
          lte: maxPrice,
        },
      }),
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
        orderBy: {
          createdAt: "desc",
        },
        include: {
          category: true,
        },
      }),
      prisma.product.count({
        where,
      }),
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
  }

  async update(id: string, data: Prisma.ProductUpdateInput) {
    const { stockQuantity, ...safeData } = data;

    if (stockQuantity !== undefined) {
      throw new DatabaseError(
        "Stock quantity cannot be updated through this endpoint. Use /api/products/:id/stock instead.",
        400,
        "INVALID_OPERATION"
      );
    }

    return await safeQuery(
      () =>
        prisma.product.update({
          where: { id },
          data: safeData,
          include: {
            category: true,
          },
        }),
      { model: "Product", id, operation: "update" }
    );
  }

  async delete(id: string) {
    return await safeQuery(
      () =>
        prisma.product.delete({
          where: { id },
        }),
      { model: "Product", id, operation: "delete" }
    );
  }

  async updateStock(
    id: string,
    quantity: number,
    tx?: Prisma.TransactionClient
  ) {
    const db = tx || prisma;
    return await safeQuery(
      () =>
        db.product.update({
          where: { id },
          data: {
            stockQuantity: { increment: quantity },
          },
        }),
      { model: "Product", id, operation: "update" }
    );
  }

  async addImage(id: string, images: string[]) {
    return await safeQuery(
      () =>
        prisma.product.update({
          where: { id },
          data: {
            images,
          },
        }),
      { model: "Product", id, operation: "update" }
    );
  }
}

export default new ProductRepository();
