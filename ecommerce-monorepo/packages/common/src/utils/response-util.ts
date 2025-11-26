import { Response } from "express";

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  field?: string
) => {
  return res.status(statusCode).json({
    success: false,
    errors: [{ message, field }],
  });
};

export const sendSuccess = (
  res: Response,
  data: any,
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};
