import { z } from "zod";

export const registrationSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .trim()
    .nonempty("Name is required"),

  email: z
    .email("Please provide a valid email address")
    .trim()
    .toLowerCase()
    .nonempty("Email is required"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password cannot exceed 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain uppercase, lowercase, number, and special character"
    )
    .nonempty("Password is required"),
});

export const loginSchema = z.object({
  email: z
    .email("Please provide a valid email address")
    .trim()
    .toLowerCase()
    .nonempty("Email is required"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password cannot exceed 128 characters")
    .nonempty("Password is required"),
});
