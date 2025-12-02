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
  model?: string; // e.g. "Product"
  field?: string; // e.g. "email" (Override if Prisma doesn't provide it)
  operation?: string; // e.g. "create"
  [key: string]: any;
};

export function handlePrismaError(
  error: unknown,
  context?: ErrorContext,
): Error {
  console.error("🛑 UNHANDLED PRISMA ERROR:", {
    code: (error as any).code,
    message: (error as any).message,
    meta: (error as any).meta,
  }); // 👈 Add this log!
  if (!isPrismaError(error)) {
    return new DatabaseOpError(
      "Something went wrong with the database operation",
    );
  }

  const prismaError = error as any;
  const meta = prismaError.meta || {};
  const modelName = context?.model || "Record";

  // --- CASE 1: Unique Constraint (P2002) ---
  if (prismaError.code === "P2002") {
    let rawField = "";
    // Priority 1: Standard Array
    if (Array.isArray(meta.target) && meta.target.length > 0) {
      rawField = meta.target[0];
    }
    // Priority 2: Driver Adapter (Nested fields array)
    else if (
      meta.driverAdapterError?.cause?.constraint?.fields &&
      Array.isArray(meta.driverAdapterError.cause.constraint.fields)
    ) {
      rawField = meta.driverAdapterError.cause.constraint.fields[0];
    }
    // Priority 3: String Target
    else if (typeof meta.target === "string") {
      const parts = meta.target.split("_");
      rawField = parts.length === 3 ? parts[1] : parts[0];
    }

    const fieldName = rawField || context?.field || "field";
    const humanLabel = getFieldLabel(fieldName);
    return new BadRequestError(
      `${modelName} with this ${humanLabel} already exists.`,
      fieldName,
    );
  }

  if (prismaError.code === "P2003") {
    let rawField = "";
    if (typeof meta.field_name === "string") {
      rawField = meta.field_name;
    } else if (meta.driverAdapterError?.cause?.constraint) {
      const constraintObj = meta.driverAdapterError.cause.constraint;
      const indexName =
        typeof constraintObj === "string" ? constraintObj : constraintObj.index;

      if (indexName && typeof indexName === "string") {
        const parts = indexName.split("_");
        if (parts.length >= 2) {
          if (parts[parts.length - 1] === "fkey") parts.pop();

          parts.shift();

          let extracted = parts.join("_");

          if (extracted.includes("_id")) {
            extracted = extracted.replace(/_id$/, "Id");
          } else {
            extracted += "Id";
          }

          rawField = extracted;
        }
      }
    }

    const label = rawField ? getFieldLabel(rawField) : "Relation";

    return new BadRequestError(
      `Invalid ${label}. The related record does not exist.`,
    );
  }

  if (prismaError.code === "P2025") {
    return new NotFoundError(`${modelName} not found.`);
  }

  console.error("Unknown Database Error:", error);
  return new DatabaseOpError("Database connection failed");
}

export const safeQuery = async <T>(
  query: () => Promise<T>,
  context?: ErrorContext,
): Promise<T> => {
  try {
    return await query();
  } catch (error) {
    throw handlePrismaError(error, context);
  }
};
