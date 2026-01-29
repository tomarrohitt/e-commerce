import { z } from "zod";

export const registrationSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .min(1, "Name is required")
    .min(2, "Must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .trim(),
  email: z
    .string({ error: "Email is required" })
    .min(1, "Email is required")
    .trim()
    .toLowerCase()
    .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      error: "Must be a valid email address",
    }),
  password: z
    .string({ error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Must be at least 8 characters")
    .max(128, "Must not exceed 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Must contain uppercase, lowercase, number, and special character",
    ),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ error: "Current Password is required" })
    .min(1, "Current Password is required")
    .min(8, "Must be at least 8 characters")
    .max(128, "Must not exceed 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Must contain uppercase, lowercase, number, and special character",
    ),
  newPassword: z
    .string({ error: "New Password is required" })
    .min(1, "New Password is required")
    .min(8, "Must be at least 8 characters")
    .max(128, "Must not exceed 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Must contain uppercase, lowercase, number, and special character",
    ),
});

export const loginSchema = registrationSchema.omit({ name: true });

export const createAddressSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, " Must be at least 2 characters long.")
    .max(50, " Must not be longer than 50 characters."),

  street: z
    .string()
    .min(3, "Must be at least 3 characters long.")
    .max(255, "Must not be longer than 255 characters."),

  city: z
    .string()
    .min(2, "Must be at least 2 characters long.")
    .max(100, "Must not be longer than 100 characters."),

  state: z
    .string()
    .min(2, "Must be at least 2 characters long.")
    .max(100, "Must not be longer than 100 characters."),

  zipCode: z
    .string()
    .min(3, "Must be at least 3 characters long.")
    .max(20, "Must not be longer than 20 characters."),

  country: z
    .string()
    .min(2, "Must be at least 2 characters long.")
    .max(100, "Must not be longer than 100 characters."),

  phoneNumber: z
    .string()
    .min(8, "Must be at least 8 digits long.")
    .max(13, "Must not be longer than 13 digits."),
});

export const updateAddressSchema = createAddressSchema.partial();

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
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;

export type RegistrationInput = z.infer<typeof registrationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
