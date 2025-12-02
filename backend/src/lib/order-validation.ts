import Joi from "joi";
import { OrderStatus } from "@prisma/client";

export const createOrderSchema = Joi.object({
  shippingAddressId: Joi.string().required().messages({
    "string.empty": "Shipping address is required",
  }),
  paymentMethod: Joi.string()
    .valid("stripe", "cod")
    .optional()
    .default("stripe"),
});

export const refundOrderSchema = Joi.object({
  amount: Joi.number().positive().precision(2).optional(),
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(OrderStatus))
    .required(),
});

export const listOrdersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string()
    .valid(...Object.values(OrderStatus))
    .optional(),
});

export const listAdminOrdersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string()
    .valid(...Object.values(OrderStatus))
    .optional(),
  userId: Joi.string().optional(),
  sortBy: Joi.string().valid("createdAt", "totalAmount").default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});
