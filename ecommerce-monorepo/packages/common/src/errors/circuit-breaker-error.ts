import { CustomError } from "./custom-error";

export class CircuitBreakerOpenError extends CustomError {
  statusCode = 503;

  constructor(
    message: string = "Service temporarily unavailable (Circuit Open)"
  ) {
    super(message);
    Object.setPrototypeOf(this, CircuitBreakerOpenError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
