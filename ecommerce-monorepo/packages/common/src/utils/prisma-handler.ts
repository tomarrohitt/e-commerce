import { PrismaLikeError } from "../types/prisma-types";
import { BadRequestError } from "../errors/bad-request-error";
import { DatabaseOpError } from "../errors/db-error";
import { NotFoundError } from "../errors/not-found-error";

function isPrismaError(error: unknown): error is PrismaLikeError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as any).code === "string"
  );
}

const FIELD_LABELS: Record<string, string> = {
  email: "Email",
  name: "Name",
  sku: "SKU",
  slug: "Slug",
  token: "Token",
  categoryId: "Category",
  productId: "Product",
  userId: "User",
  orderId: "Order",
};

function getFieldLabel(field: string) {
  return FIELD_LABELS[field] || field.charAt(0).toUpperCase() + field.slice(1);
}

export type ErrorContext = {
  modelName?: string;
  field?: string;
};

export function handlePrismaError(
  error: unknown,
  context?: ErrorContext
): Error {
  if (!isPrismaError(error)) {
    // Not even a Prisma error
    return new DatabaseOpError(
      "Something went wrong with the database operation"
    );
  }

  // Unique violation
  if (error.code === "P2002") {
    const field = (error.meta?.target?.[0] as string) || "Field";
    const label = getFieldLabel(field);
    return new BadRequestError(`${label} already exists.`);
  }

  // Not found
  if (error.code === "P2025") {
    const model = context?.modelName || "Record";
    return new NotFoundError(`${model} not found.`);
  }

  // Foreign key issues
  if (error.code === "P2003") {
    const raw = error.meta?.field_name as string | undefined;
    const field = raw?.replace(/Id$/, "") || "Relation";
    const label = getFieldLabel(field);
    return new BadRequestError(
      `Invalid ${label}. The related record does not exist.`
    );
  }

  return new DatabaseOpError("Database connection failed");
}

export async function safeQuery<T>(
  operation: () => Promise<T>,
  context?: ErrorContext
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw handlePrismaError(error, context);
  }
}
