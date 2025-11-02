import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { safeQuery } from "../middleware/prisma-error-middleware";

class CategoryRepository {
  async create(data: Prisma.CategoryCreateInput) {
    return await safeQuery(
      () =>
        prisma.category.create({
          data,
        }),
      { model: "Category", operation: "create" },
    );
  }

  async findbyId(id: string) {
    return await safeQuery(
      () =>
        prisma.category.findUnique({
          where: { id },
          include: {
            _count: {
              select: { products: true },
            },
          },
        }),
      { model: "Category", id, operation: "find" },
    );
  }

  async findBySlug(slug: string) {
    return await safeQuery(
      () =>
        prisma.category.findUnique({
          where: { slug },
          include: {
            _count: {
              select: { products: true },
            },
          },
        }),
      { model: "Category", slug, operation: "find" },
    );
  }

  async findMany() {
    return await safeQuery(
      () =>
        prisma.category.findMany({
          include: {
            _count: {
              select: { products: true },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        }),
      { model: "Category", operation: "find" },
    );
  }

  async update(id: string, data: Prisma.CategoryUpdateInput) {
    return await safeQuery(
      () =>
        prisma.category.update({
          where: { id },
          data,
        }),
      { model: "Category", id, operation: "update" },
    );
  }

  async delete(id: string) {
    const products = await prisma.product.findFirst({
      where: { categoryId: id },
    });

    if (products) {
      throw new Error("Cannot delete category with associated products");
    }

    return await safeQuery(
      () =>
        prisma.category.delete({
          where: { id },
        }),
      { model: "Category", id, operation: "delete" },
    );
  }
}

export default new CategoryRepository();
