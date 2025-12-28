import { Router } from "express";
import reviewController from "../controllers/review-controller";

const reviewRouter = Router();

reviewRouter.get("/", reviewController.listReviews);
reviewRouter.post("/", reviewController.createReview);

reviewRouter.get("/status/:id", reviewController.getReview);
reviewRouter.delete("/:id", reviewController.deleteReview);
reviewRouter.patch("/:id", reviewController.updateReview);

export default reviewRouter;
