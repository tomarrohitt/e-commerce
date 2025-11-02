import { Prisma } from "../../generated/prisma/client";

export class DatabaseError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public errorCode?: string,
  ) {
    super(message);
    this.name = "DatabaseError";
  }
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

function extractModelName(
  error: Prisma.PrismaClientKnownRequestError,
): string | null {
  const meta = error.meta as any;

  if (meta?.modelName) {
    return meta.modelName;
  }

  const message = error.message.toLowerCase();

  if (message.includes("product")) return "Product";
  if (message.includes("category")) return "Category";
  if (message.includes("user")) return "User";
  if (message.includes("order")) return "Order";
  if (message.includes("address")) return "Address";

  return null;
}

export type ErrorContext = {
  id?: string;
  slug?: string;
  model?: string;
  operation?: string;
};

export function handlePrismaError(error: unknown, context?: ErrorContext) {
  if (error instanceof DatabaseError) {
    return error;
  }

  //DUPLICATE FIELD

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const meta = error.meta as { target?: string[] };
      const fields = meta?.target || [];

      if (fields.length === 1) {
        const field = fields[0];
        const label = getFieldLabel(field);
        return new DatabaseError(
          `${label} already exists. Please use a different ${label.toLowerCase()}.`,
          409,
          "DUPLICATE_ENTRY",
        );
      }
      return new DatabaseError(
        "A record with these details already exists.",
        409,
        "DUPLICATE_ENTRY",
      );
    }

    // NOT FOUND ERRORS

    if (error.code === "P2025") {
      const modelName = context?.model || extractModelName(error) || "Record";
      const id = context?.id;
      const slug = context?.slug;

      if (id) {
        return new DatabaseError(
          `${modelName} with ID '${id}' not found. It may have been deleted.`,
          404,
          "NOT_FOUND",
        );
      }
      if (slug) {
        return new DatabaseError(
          `${modelName} with slug '${slug}' not found. It may have been deleted.`,
          404,
          "NOT_FOUND",
        );
      }

      return new DatabaseError(
        `${modelName} not found. It may have been deleted.`,
        404,
        "NOT_FOUND",
      );
    }

    // Creating Editing, Deleting some which doesn't exist
    if (error.code === "P2003") {
      const meta = error.meta as { field_name?: string };
      const field = meta?.field_name;

      if (field) {
        // Extract the relation name (e.g., "categoryId" -> "Category")
        const relationName = field.replace(/Id$/, "");
        const label = getFieldLabel(relationName);
        return new DatabaseError(
          `${label} not found. Please select a valid ${label.toLowerCase()}.`,
          400,
          "INVALID_REFERENCE",
        );
      }

      return new DatabaseError(
        "Invalid reference. The related record does not exist.",
        400,
        "INVALID_REFERENCE",
      );
    }

    // Relation violation
    if (error.code === "P2014") {
      const modelName = context?.model || "record";
      return new DatabaseError(
        `Cannot delete this ${modelName.toLowerCase()} because it is being used by other records.`,
        400,
        "RELATION_VIOLATION",
      );
    }

    // Other Prisma errors - generic message
    console.error("Unhandled Prisma error:", error.code, error.message);
    return new DatabaseError(
      "A database error occurred. Please try again.",
      500,
      error.code,
    );
  }
}

export async function safeQuery<T>(
  queryFn: () => Promise<T>,
  context?: ErrorContext,
): Promise<T> {
  try {
    return await queryFn();
  } catch (error) {
    throw handlePrismaError(error, context);
  }
}
