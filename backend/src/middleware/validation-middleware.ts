// auth/hooks.ts
import { APIError } from "better-auth";
import type { BetterAuthOptions } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import {
  loginSchema,
  registerationSchema,
} from "../lib/user-validation-schema";

export const authHooks: BetterAuthOptions["hooks"] = {
  before: createAuthMiddleware(async (ctx) => {
    if (ctx.path === "/sign-up/email") {
      const { error } = registerationSchema.validate(ctx.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      if (error) {
        throw new APIError("BAD_REQUEST", {
          message: "Validation failed",
          details: error.details.map((detail) => ({
            field: detail.path[0],
            message: detail.message,
          })),
        });
      }
    }
    if (ctx.path === "/sign-in/email") {
      const { error } = loginSchema.validate(ctx.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      if (error) {
        throw new APIError("BAD_REQUEST", {
          message: "Validation failed",
          details: error.details.map((detail) => ({
            field: detail.path[0],
            message: detail.message,
          })),
        });
      }
    }
  }),
};
