import { RequestValidationError } from "../errors/request-validation-error";
import { ZodType } from "zod";

export class InputUtil {
  static generateSlug(text: string): string {
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

  static validateAndThrow<T>(schema: ZodType<T>, data: unknown): T {
    const result = schema.safeParse(data);

    if (!result.success) {
      throw new RequestValidationError(result.error);
    }

    return result.data;
  }

  static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  static truncate(text: string, maxLength: number, suffix = "..."): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  }
}

export const generateSlug = InputUtil.generateSlug.bind(InputUtil);
export const validateAndThrow = InputUtil.validateAndThrow.bind(InputUtil);
