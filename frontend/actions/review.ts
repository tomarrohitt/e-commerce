"use server";

import { simplifyZodErrors } from "@/lib/constants/error-simplifier";
import { createReview, updateReview } from "@/lib/services/products";
import { createReviewSchema, updateReviewSchema } from "@/types";
import { revalidateTag } from "next/cache";
import z from "zod";

export const createReviewAction = async (_: any, formData: FormData) => {
  const rawRating = formData.get("rating");
  const rawComment = formData.get("comment");
  const productId = formData.get("productId");
  const data = {
    rating: Number(rawRating),
    comment: rawComment as string,
    productId,
  };
  const result = createReviewSchema.safeParse({ ...data, productId });

  if (!result.success) {
    const formattedErrors = z.treeifyError(result.error);
    return {
      success: false,
      message: "Validation failed",
      errors: simplifyZodErrors(formattedErrors),
      inputs: data,
    };
  }

  try {
    await createReview(result.data);
    revalidateTag(`product-${productId}`);
    revalidateTag(`reviews-${productId}`);
    return {
      success: true,
      message: "Review Posted",
      errors: {
        rating: "",
        comment: "",
        productId: "",
      },
      inputs: {
        rating: data.rating,
        comment: data.comment,
        productId: data.productId,
      },
    };
  } catch (error: any) {
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
        errors: {
          rating: "",
          comment: "",
          productId: "",
        },
        inputs: {
          rating: data.rating,
          comment: data.comment,
          productId: data.productId,
        },
      };
    }
    return {
      success: false,
      message:
        error?.message || error?.errors?.[0]?.message || "Request failed",
      errors: {
        rating: "",
        comment: "",
        productId: "",
      },
      inputs: {
        rating: data.rating,
        comment: data.comment,
        productId: data.productId,
      },
    };
  }
};

export const updateReviewAction = async (
  id: string,
  _: any,
  formData: FormData,
) => {
  const rawRating = formData.get("rating");
  const rawComment = formData.get("comment");
  const productId = formData.get("productId");
  const data = {
    rating: Number(rawRating),
    comment: rawComment as string,
  };
  const result = updateReviewSchema.safeParse(data);

  if (!result.success) {
    const formattedErrors = z.treeifyError(result.error);
    return {
      success: false,
      message: "Validation failed",
      errors: simplifyZodErrors(formattedErrors),
      inputs: data,
    };
  }

  try {
    await updateReview({ ...data, id });
    revalidateTag(`product-${productId}`);
    revalidateTag(`reviews-${productId}`);
    return {
      success: true,
      message: "Review Posted",
      errors: {
        rating: "",
        comment: "",
      },
      inputs: {
        rating: data.rating,
        comment: data.comment,
      },
    };
  } catch (error: any) {
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
        errors: {
          rating: "",
          comment: "",
        },
        inputs: {
          rating: data.rating,
          comment: data.comment,
        },
      };
    }
    return {
      success: false,
      message:
        error?.message || error?.errors?.[0]?.message || "Request failed",
      errors: {
        rating: "",
        comment: "",
      },
      inputs: {
        rating: data.rating,
        comment: data.comment,
      },
    };
  }
};
