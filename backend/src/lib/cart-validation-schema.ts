import Joi from "joi";

export const addToCartSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().integer().positive().min(1).max(100).required(),
});

export const updateQuantitySchema = Joi.object({
  quantity: Joi.number().integer().min(1).max(100).required(),
});
