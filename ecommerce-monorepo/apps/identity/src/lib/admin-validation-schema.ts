import z from "zod";

export const adminListUsersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),

  role: z.enum(["user", "admin"]).optional(),
  emailVerified: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  search: z.string().trim().optional(),

  sortBy: z.enum(["createdAt", "name", "email"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const adminUpdateUserSchema = z.object({
  name: z.string().trim().min(3).optional(),
  email: z.email().optional(),
  role: z.enum(["user", "admin"]).optional(),
  emailVerified: z.boolean().optional(),
});

export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;

export type AdminListUsersQuery = z.infer<typeof adminListUsersSchema>;
