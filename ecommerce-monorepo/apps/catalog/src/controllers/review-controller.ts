import { Request, Response } from "express";
import {
  createReviewSchema,
  updateReviewSchema,
  listReviewsSchema,
  CreateReviewInput,
  UpdateReviewInput,
  ListReviewsQuery,
} from "../lib/validation-schema";
import reviewRepository from "../repository/review-repository";
import {
  sendCreated,
  sendSuccess,
  validateAndThrow,
  BadRequestError,
} from "@ecommerce/common";

class ReviewController {
  async createReview(req: Request, res: Response) {
    const input = validateAndThrow<CreateReviewInput>(
      createReviewSchema,
      req.body
    );

    const review = await reviewRepository.create({
      ...input,
      userId: req.user.id,
    });

    return sendCreated(res, review, "Review posted successfully");
  }

  async listReviews(req: Request, res: Response) {
    const filters = validateAndThrow<ListReviewsQuery>(
      listReviewsSchema,
      req.query
    );

    const result = await reviewRepository.findMany(filters);

    return sendSuccess(res, result);
  }

  async getReview(req: Request, res: Response) {
    const review = await reviewRepository.findByUserAndProduct(
      req.params.id,
      req.user.id
    );
    return sendSuccess(res, review);
  }

  async updateReview(req: Request, res: Response) {
    const input = validateAndThrow<UpdateReviewInput>(
      updateReviewSchema,
      req.body
    );

    const updatedReview = await reviewRepository.update(
      req.params.id,
      req.user.id,
      input
    );

    return sendSuccess(res, updatedReview, "Review updated successfully");
  }

  // DELETE /api/reviews/:id
  async deleteReview(req: Request, res: Response) {
    if (!req.user || !req.user.id) {
      throw new BadRequestError("User must be logged in.");
    }

    await reviewRepository.delete(req.params.id, req.user.id);

    return sendSuccess(res, null, "Review deleted successfully");
  }
}

export default new ReviewController();
