import { z } from "zod";

export const registrationSchema = z.object({
  name: z
    .string({ message: "Name is required" })
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .trim(),
  email: z
    .string({ message: "Email is required" })
    .min(1, "Email is required")
    .trim()
    .toLowerCase()
    .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "Please provide a valid email address",
    }),
  password: z
    .string({ message: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password cannot exceed 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain uppercase, lowercase, number, and special character",
    ),
});

export const loginSchema = registrationSchema.omit({ name: true });

export const createAddressSchema = z.object({
  type: z.enum(["shipping", "billing"]).default("shipping"),
  name: z.string().trim().max(50).optional().default("Home"),
  street: z
    .string({ error: "Street is required" })
    .min(3, "Street address is too short")
    .max(255),
  city: z.string({ error: "City is required" }).min(2).max(100),
  state: z.string({ error: "State is required" }).min(2).max(100),
  zipCode: z.string({ error: "Zip Code is required" }).min(3).max(20),
  country: z.string({ error: "Country is required" }).min(2).max(100),
  phoneNumber: z.string().min(8).max(20).optional(),
});

export enum Role {
  ADMIN = "admin",
  USER = "user",
}

export type User = {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: Role;
  emailVerified: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type AuthResponse = {
  user: User;
  session: {
    token: string;
    expiresAt: string;
  };
};

export type LoginResponse = {
  user: User;
  token: string;
  redirect: boolean;
};

export type Address = CreateAddressInput & {
  id: string;
  isDefault: boolean;
  createdAt?: string;
};

export type CreateAddressInput = z.infer<typeof createAddressSchema>;

export type RegistrationInput = z.infer<typeof registrationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
