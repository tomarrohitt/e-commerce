import { safeQuery, BadRequestError } from "@ecommerce/common";
import { prisma } from "../config/prisma";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../lib/validation-schema";

class CategoryRepository {
  async create(data: CreateCategoryInput) {
    return await safeQuery(
      () =>
        prisma.category.create({
          data,
        }),
      { model: "Category", operation: "create" }
    );
  }

  async findbyId(id: string) {
    return await safeQuery(
      () =>
        prisma.category.findUniqueOrThrow({
          where: { id },
          include: {
            _count: { select: { products: true } },
          },
        }),
      { model: "Category", operation: "find" }
    );
  }

  async findMany() {
    return await safeQuery(
      () =>
        prisma.category.findMany({
          include: {
            _count: { select: { products: true } },
          },
          orderBy: { createdAt: "asc" },
        }),
      { model: "Category", operation: "list" }
    );
  }

  async update(id: string, data: UpdateCategoryInput) {
    return await safeQuery(
      () =>
        prisma.category.update({
          where: { id },
          data,
        }),
      { model: "Category", operation: "update" }
    );
  }

  async delete(id: string) {
    const products = await prisma.product.findFirst({
      where: { categoryId: id },
    });

    if (products) {
      throw new BadRequestError(
        "Cannot delete category with associated products"
      );
    }

    return await safeQuery(
      () =>
        prisma.category.delete({
          where: { id },
        }),
      { model: "Category", operation: "delete" } // ✅ Context Added
    );
  }
}

export default new CategoryRepository();
