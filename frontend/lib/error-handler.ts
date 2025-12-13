// ============================================
// lib/utils/error-handler.ts
// ============================================
import toast from "react-hot-toast";
import type { ApiError } from "@/types";

export function handleApiError(
  error: unknown,
  defaultMessage = "An error occurred",
) {
  const apiError = error as ApiError;

  if (apiError.details && Array.isArray(apiError.details)) {
    apiError.details.forEach((detail) => {
      toast.error(detail.message);
    });
  } else if (apiError.error) {
    toast.error(apiError.error);
  } else {
    toast.error(defaultMessage);
  }
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    ("error" in error || "details" in error)
  );
}
