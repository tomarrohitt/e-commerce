import Joi from "joi";

export const createAddressSchema = Joi.object({
  type: Joi.string().valid("shipping", "billing").required(),
  street: Joi.string().min(5).max(100).required(),
  city: Joi.string().min(2).max(100).required(),
  state: Joi.string().min(2).max(100).required(),
  zipCode: Joi.string().min(2).max(100).required(),
  country: Joi.string().min(2).max(100).required(),
});

export const updateAddressSchema = Joi.object({
  type: Joi.string().valid("shipping", "billing").optional(),
  street: Joi.string().min(5).max(100).optional(),
  city: Joi.string().min(2).max(100).optional(),
  state: Joi.string().min(2).max(100).optional(),
  zipCode: Joi.string().min(2).max(100).optional(),
  country: Joi.string().min(2).max(100).optional(),
  isDefault: Joi.boolean().optional(),
});

export const listAddressSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),

  search: Joi.string().optional(),
  zipCode: Joi.string().optional(),
  state: Joi.string().optional(),
  city: Joi.string().optional(),
});
