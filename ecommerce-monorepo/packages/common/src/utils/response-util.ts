import { Response } from "express";
import { ErrorResponse } from "../types/error-types";

export interface SuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
  meta?: Record<string, any>;
}

export class ResponseUtil {
  static sendError(
    res: Response,
    statusCode: number,
    message: string,
    field?: string,
  ): Response<ErrorResponse> {
    return res.status(statusCode).json({
      success: false,
      errors: [{ message, field }],
    });
  }

  static sendSuccess<T>(
    res: Response,
    data?: T,
    statusCode: number = 200,
    message?: string,
    meta?: Record<string, any>,
  ): Response<SuccessResponse<T>> {
    return res.status(statusCode).json({
      success: true,
      ...(data !== undefined && { data }),
      ...(message && { message }),
      ...(meta && { meta }),
    });
  }

  static sendCreated<T>(
    res: Response,
    data: T,
    message?: string,
  ): Response<SuccessResponse<T>> {
    return this.sendSuccess(res, data, 201, message);
  }

  static sendNoContent(res: Response): Response {
    return res.status(204).send();
  }
}

// Backward compatibility exports
export const sendError = ResponseUtil.sendError.bind(ResponseUtil);
export const sendSuccess = ResponseUtil.sendSuccess.bind(ResponseUtil);
