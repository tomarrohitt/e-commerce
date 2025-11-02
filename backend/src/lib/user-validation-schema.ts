import Joi from "joi";

export const registerationSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().required().messages({
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name cannot exceed 100 characters",
    "string.empty": "Name is required",
  }),
  email: Joi.string().email().lowercase().trim().required().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
  }),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.max": "Password cannot exceed 128 characters",
      "string.empty": "Password is required",
      "string.pattern.base":
        "Password must contain uppercase, lowercase, number, and special character",
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
  }),
  password: Joi.string().min(8).max(128).required().messages({
    "string.min": "Password must be at least 8 characters",
    "string.max": "Password cannot exceed 128 characters",
    "string.empty": "Password is required",
  }),
});
