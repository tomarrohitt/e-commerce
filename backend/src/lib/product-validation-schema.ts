import Joi from "joi";

export const createProductSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  price: Joi.number().positive().precision(2).required(),
  description: Joi.string().min(10).max(1000).required(),
  stockQuantity: Joi.number().integer().min(0).required(),
  sku: Joi.string().alphanum().min(5).max(20).required(),

  categoryId: Joi.string().required(),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(3).max(50).optional(),
  price: Joi.number().positive().precision(2).optional(),
  description: Joi.string().min(10).max(1000).optional(),
  stockQuantity: Joi.number().integer().min(0).optional(),
  sku: Joi.string().alphanum().min(5).max(20).optional(),

  categoryId: Joi.string().optional(),
});

export const addImagesSchema = Joi.object({
  images: Joi.array().items(Joi.string().uri()).min(1).required(),
});

export const listProductSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().optional(),
  inStock: Joi.boolean().optional(),
  minPrice: Joi.number().positive().optional(),
  maxPrice: Joi.number().positive().optional(),
  categoryId: Joi.string().optional(),
});

export const createCategorySchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  slug: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .min(3)
    .max(50)
    .required(),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().min(3).max(50).required().optional(),
  slug: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .min(3)
    .max(50)
    .required()
    .optional(),
});
