import { CustomError } from "./custom-error";

export class DatabaseOpError extends CustomError {
  statusCode = 500;

  constructor(public message: string) {
    super(message);
    Object.setPrototypeOf(this, DatabaseOpError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
