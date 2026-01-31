import { prisma } from "../config/prisma";
import { safeQuery, BadRequestError } from "@ecommerce/common";
import {
  CreateReviewInput,
  UpdateReviewInput,
  ListReviewsQuery,
} from "../lib/validation-schema";
import { Prisma } from "../generated/prisma-client";

class ReviewRepository {
  private async updateProductStats(
    tx: Prisma.TransactionClient,
    productId: string,
  ) {
    const stats = await tx.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const newRating = stats._avg.rating || 0;
    const newCount = stats._count.rating || 0;
    await tx.product.update({
      where: { id: productId },
      data: {
        rating: newRating,
        reviewCount: newCount,
      },
      select: {
        id: true,
        rating: true,
        reviewCount: true,
      },
    });
  }

  async create(
    data: CreateReviewInput & {
      userId: string;
    },
  ) {
    return await safeQuery(
      async () => {
        const hasPurchased = await prisma.verifiedPurchase.findUnique({
          where: {
            userId_productId: {
              userId: data.userId,
              productId: data.productId,
            },
          },
        });

        if (!hasPurchased) {
          throw new BadRequestError(
            "You can only review products you have purchased.",
          );
        }

        const existingReview = await prisma.review.findUnique({
          where: {
            userId_productId: {
              userId: data.userId,
              productId: data.productId,
            },
          },
          select: { id: true },
        });

        if (existingReview) {
          throw new BadRequestError("You have already reviewed this product.");
        }

        const id = await prisma.$transaction(async (tx) => {
          const review = await prisma.review.create({
            data,
            select: {
              id: true,
            },
          });

          await this.updateProductStats(tx, data.productId);

          return review.id;
        });

        return { id };
      },
      { model: "Review", operation: "create" },
    );
  }

  async update(id: string, userId: string, data: UpdateReviewInput) {
    return await safeQuery(
      async () => {
        const existing = await prisma.review.findUnique({ where: { id } });
        if (!existing) throw new BadRequestError("Review not found");
        if (existing.userId !== userId) {
          throw new BadRequestError("Not authorized to update this review");
        }

        await prisma.$transaction(async (tx) => {
          await tx.review.update({
            where: { id },
            data,
            select: { id: true },
          });
          await this.updateProductStats(tx, existing.productId);
        });
        return { id };
      },
      { model: "Review", operation: "update" },
    );
  }

  async delete(id: string, userId: string) {
    return await safeQuery(
      async () => {
        const existing = await prisma.review.findUnique({ where: { id } });
        if (!existing) throw new BadRequestError("Review not found");
        if (existing.userId !== userId) {
          throw new BadRequestError("Not authorized to delete this review");
        }

        await prisma.$transaction(async (tx) => {
          await tx.review.delete({ where: { id } });
          await this.updateProductStats(tx, existing.productId);
        });
        return { id };
      },
      { model: "Review", operation: "delete" },
    );
  }

  async findMany(options: ListReviewsQuery) {
    const { productId, page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    return await safeQuery(
      async () => {
        const where = { productId };

        const [reviews, total] = await Promise.all([
          prisma.review.findMany({
            where,
            take: limit,
            skip: offset,
            orderBy: { createdAt: "desc" },
            include: {
              user: {
                select: { name: true, image: true },
              },
            },
          }),
          prisma.review.count({ where }),
        ]);

        return {
          reviews,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        };
      },
      { model: "Review", operation: "list" },
    );
  }

  async findByUserAndProduct(productId: string, userId: string) {
    return await safeQuery(
      async () => {
        const existingReview = await prisma.review.findUnique({
          where: {
            userId_productId: {
              userId,
              productId,
            },
          },
          select: {
            id: true,
            comment: true,
            rating: true,
          },
        });
        return existingReview;
      },

      { model: "Review", operation: "check_exists" },
    );
  }
}

export default new ReviewRepository();
