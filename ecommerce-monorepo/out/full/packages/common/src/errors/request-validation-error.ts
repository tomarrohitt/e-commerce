import { ZodError } from "zod";
import { CustomError } from "./custom-error";

export class RequestValidationError extends CustomError {
  statusCode = 400;

  constructor(public error: ZodError) {
    super("Invalid request parameters");
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors() {
    return this.error.issues.map((issue) => ({
      field: String(issue.path[0]), // Handles numbers or strings
      message: issue.message,
    }));
  }
}
