import { api } from "./server";
import type {
  CreateReviewInput,
  ReviewResponse,
  ReviewsResponse,
  ReviewTrim,
} from "@/types";

export async function createReview(data: CreateReviewInput) {
  const res = await api("/reviews", {
    method: "POST",
    body: data,
  });

  if (!res.ok) throw await res.json();

  const json = (await res.json()) as ReviewsResponse;
  return json.data;
}

export async function updateReview(data: ReviewTrim) {
  const res = await api(`/reviews/${data.id}`, {
    method: "PATCH",
    body: data,
  });

  if (!res.ok) throw await res.json();

  const json = (await res.json()) as ReviewResponse;
  return json.data;
}

export async function removeReview(productId: string) {
  const res = await api(`/reviews/${productId}`, {
    method: "DELETE",
  });

  if (!res.ok) throw await res.json();

  const json = (await res.json()) as ReviewsResponse;
  return json.data;
}
