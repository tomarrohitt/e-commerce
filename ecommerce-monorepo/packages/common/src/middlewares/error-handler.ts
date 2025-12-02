import { Request, Response, NextFunction } from "express";
import { CustomError } from "../errors/custom-error";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error("🔥 GLOBAL ERROR CATCHER:", err);
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      success: false,
      errors: err.serializeErrors(),
    });
  }

  console.error("---------------------------------");
  console.error("UNEXPECTED ERROR:", err);
  console.error("---------------------------------");

  res.status(500).json({
    success: false,
    errors: [{ message: "Something went wrong" }],
  });
};
