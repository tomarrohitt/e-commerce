import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { authHooks } from "../middleware/validation-middleware";
import { UserEventType } from "@ecommerce/common";
import { dispatchUserEvent } from "../service/outbox-dispatcher";

const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignInAfterVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await dispatchUserEvent(UserEventType.FORGOT_PASSWORD, user, {
        link: url,
      });
    },
  },
  baseURL: process.env.BASE_URL,

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: false,
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "user",
        input: true,
      },
    },
  },

  hooks: authHooks,

  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: 86400,
    sendVerificationEmail: async ({ user, url }) => {
      const link = url.split("&")[0] + "&callbackURL=/";
      await dispatchUserEvent(UserEventType.REGISTERED, user, { link });
    },
    async afterEmailVerification(user) {
      await dispatchUserEvent(UserEventType.VERIFIED, user);
    },
  },
  trustedOrigins: [process.env.CLIENT_URL || ""],
  databaseHooks: {
    user: {
      create: {
        after: async (user, ctx) => {
          ctx?.context.adapter;
        },
      },
    },
  },
});

export default auth;
