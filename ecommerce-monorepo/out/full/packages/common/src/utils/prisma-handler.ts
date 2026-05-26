// src/utils/prisma-handler.ts

import { PrismaLikeError } from "../types/prisma-types";
import { BadRequestError } from "../errors/bad-request-error";
import { DatabaseOpError } from "../errors/db-error";
import { NotFoundError } from "../errors/not-found-error";
import { FIELD_LABELS } from "../constants";
import { LoggerFactory } from "../services/logger-service";
import { CustomError } from "../errors/custom-error";

const logger = LoggerFactory.create("PrismaHandler");

export interface ErrorContext {
  model?: string;
  field?: string;
  operation?: string;
  [key: string]: any;
}

function isPrismaError(error: unknown): error is PrismaLikeError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as any).code === "string"
  );
}

function getFieldLabel(field: string): string {
  return FIELD_LABELS[field] || field.charAt(0).toUpperCase() + field.slice(1);
}

class PrismaErrorHandler {
  // Extract field name from various Prisma error formats
  private extractFieldFromUniqueConstraint(meta: any): string {
    // Priority 1: Standard Array
    if (Array.isArray(meta.target) && meta.target.length > 0) {
      return meta.target[0];
    }

    // Priority 2: Driver Adapter (Nested fields array)
    if (meta.driverAdapterError?.cause?.constraint?.fields) {
      const fields = meta.driverAdapterError.cause.constraint.fields;
      if (Array.isArray(fields) && fields.length > 0) {
        return fields[0];
      }
    }

    // Priority 3: String Target
    if (typeof meta.target === "string") {
      const parts = meta.target.split("_");
      return parts.length === 3 ? parts[1] : parts[0];
    }

    return "";
  }

  // Extract field name from foreign key constraint
  private extractFieldFromForeignKey(meta: any): string {
    // Direct field_name
    if (typeof meta.field_name === "string") {
      return meta.field_name;
    }

    // Extract from driver adapter constraint
    if (meta.driverAdapterError?.cause?.constraint) {
      const constraintObj = meta.driverAdapterError.cause.constraint;
      const indexName =
        typeof constraintObj === "string" ? constraintObj : constraintObj.index;

      if (indexName && typeof indexName === "string") {
        return this.parseIndexName(indexName);
      }
    }

    return "";
  }

  private parseIndexName(indexName: string): string {
    const parts = indexName.split("_");

    if (parts.length < 2) {
      return "";
    }

    // Remove "fkey" suffix if present
    if (parts[parts.length - 1] === "fkey") {
      parts.pop();
    }

    // Remove table name prefix
    parts.shift();

    let extracted = parts.join("_");

    // Ensure camelCase with "Id" suffix
    if (extracted.includes("_id")) {
      extracted = extracted.replace(/_id$/, "Id");
    } else {
      extracted += "Id";
    }

    return extracted;
  }

  // P2002: Unique constraint violation
  handleUniqueConstraint(error: any, context?: ErrorContext): Error {
    const meta = error.meta || {};
    const modelName = context?.model || "Record";
    const rawField = this.extractFieldFromUniqueConstraint(meta);
    const fieldName = rawField || context?.field || "field";
    const humanLabel = getFieldLabel(fieldName);

    return new BadRequestError(
      `${modelName} with this ${humanLabel} already exists`,
      fieldName
    );
  }

  // P2003: Foreign key constraint violation
  handleForeignKeyConstraint(error: any, context?: ErrorContext): Error {
    const meta = error.meta || {};
    const rawField = this.extractFieldFromForeignKey(meta);
    const label = rawField ? getFieldLabel(rawField) : "Relation";

    return new BadRequestError(
      `Invalid ${label}. The related record does not exist`,
      rawField
    );
  }

  // P2025: Record not found
  handleRecordNotFound(context?: ErrorContext): Error {
    const modelName = context?.model || "Record";
    return new NotFoundError(`${modelName} not found`);
  }

  // P2016: Query interpretation error (usually malformed where clause)
  handleQueryInterpretation(error: any): Error {
    return new BadRequestError("Invalid query parameters");
  }

  // P2021: Table does not exist
  handleTableNotFound(error: any): Error {
    logger.error("Database schema error - table not found", error);
    return new DatabaseOpError("Database schema error");
  }

  // Default handler for unknown errors
  handleUnknown(error: any, context?: ErrorContext): Error {
    logger.error("Unhandled Prisma error", error, {
      code: error.code,
      meta: error.meta,
      context,
    });

    return new DatabaseOpError("An unexpected database error occurred");
  }
}

const handler = new PrismaErrorHandler();

export function handlePrismaError(
  error: unknown,
  context?: ErrorContext
): Error {
  if (error instanceof CustomError) {
    return error;
  }
  if (!isPrismaError(error)) {
    logger.error("Non-Prisma error passed to handler", error as Error);
    return new DatabaseOpError("Database operation failed");
  }

  const prismaError = error as any;

  switch (prismaError.code) {
    case "P2002":
      return handler.handleUniqueConstraint(prismaError, context);

    case "P2003":
      return handler.handleForeignKeyConstraint(prismaError, context);

    case "P2025":
      return handler.handleRecordNotFound(context);

    case "P2016":
      return handler.handleQueryInterpretation(prismaError);

    case "P2021":
      return handler.handleTableNotFound(prismaError);

    default:
      return handler.handleUnknown(prismaError, context);
  }
}

// Wrapper for safe query execution
export async function safeQuery<T>(
  query: () => Promise<T>,
  context?: ErrorContext
): Promise<T> {
  try {
    return await query();
  } catch (error) {
    throw handlePrismaError(error, context);
  }
}

// Batch query wrapper with error aggregation
export async function safeBatchQuery<T>(
  queries: Array<() => Promise<T>>,
  context?: ErrorContext
): Promise<T[]> {
  const results = await Promise.allSettled(
    queries.map((query) => safeQuery(query, context))
  );

  const errors: Error[] = [];
  const values: T[] = [];

  results.forEach((result) => {
    if (result.status === "fulfilled") {
      values.push(result.value);
    } else {
      errors.push(result.reason);
    }
  });

  if (errors.length > 0) {
    logger.error("Batch query had failures", undefined, {
      errorCount: errors.length,
      successCount: values.length,
    });

    // Throw first error for simplicity
    throw errors[0];
  }

  return values;
}
