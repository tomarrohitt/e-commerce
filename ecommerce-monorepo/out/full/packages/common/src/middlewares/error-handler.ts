import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { CustomError } from "../errors/custom-error";
import { LoggerFactory } from "../services/logger-service";
import { ErrorResponse } from "../types/error-types";

const logger = LoggerFactory.create("ErrorHandler");

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  logger.error("Request error", err, {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });

  if (err instanceof CustomError) {
    const response: ErrorResponse = {
      success: false,
      errors: err.serializeErrors(),
      timestamp: new Date().toISOString(),
    };

    res.status(err.statusCode).json(response);
    return;
  }

  logger.error("Unexpected error", err, {
    stack: err.stack,
  });

  const response: ErrorResponse = {
    success: false,
    errors: [{ message: "An unexpected error occurred" }],
    timestamp: new Date().toISOString(),
  };

  res.status(500).json(response);
};
