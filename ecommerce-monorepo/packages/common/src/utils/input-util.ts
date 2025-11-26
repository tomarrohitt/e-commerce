import { RequestValidationError } from "../errors/request-validation-error";

export function generateSlug(text: string): string {
  if (!text) return "";

  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export function validateAndThrow<T>(schema: any, data: any): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new RequestValidationError(result.error);
  }
  return result.data as T;
}
