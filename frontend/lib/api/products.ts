import api from "./server";
import type {
  CreateReviewInput,
  ReviewResponse,
  ReviewsResponse,
  ReviewTrim,
} from "@/types";

export async function createReview(data: CreateReviewInput) {
  const response = await api.post<ReviewsResponse>("/reviews", data);
  return response.data.data;
}
export async function updateReview(data: ReviewTrim) {
  const response = await api.patch<ReviewResponse>(`/reviews/${data.id}`, data);
  return response.data.data;
}
export async function removeReview(productId: string) {
  const response = await api.delete<ReviewsResponse>(`/reviews/${productId}`);
  return response.data.data;
}
