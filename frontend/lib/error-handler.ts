// ============================================
// lib/utils/error-handler.ts
// ============================================
import type { ApiError } from "@/types";

export function handleApiError(
  error: unknown,
  defaultMessage = "An error occurred",
) {
  const apiError = error as ApiError;

  if (apiError.details && Array.isArray(apiError.details)) {
    apiError.details.forEach((detail) => {});
  } else if (apiError.error) {
  } else {
  }
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    ("error" in error || "details" in error)
  );
}
