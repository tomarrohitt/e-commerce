import { APIError } from "better-auth";
import type { BetterAuthOptions } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { loginSchema, registrationSchema } from "../lib/user-validation-schema";

export const authHooks: BetterAuthOptions["hooks"] = {
  before: createAuthMiddleware(async (ctx) => {
    let schema = null;

    if (ctx.path === "/sign-up/email") schema = registrationSchema;
    if (ctx.path === "/sign-in/email") schema = loginSchema;

    if (!schema) return;

    const result = schema.safeParse(ctx.body);

    if (!result.success) {
      const formatted = result.error.issues.map((issue) => ({
        field: issue.path[0],
        message: issue.message,
      }));

      throw new APIError("BAD_REQUEST", {
        message: "Validation failed",
        details: formatted,
      });
    }
    ctx.body = result.data;
  }),
};
