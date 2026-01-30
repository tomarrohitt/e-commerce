import { betterAuth } from "better-auth/minimal";
import { openAPI } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { authHooks } from "../middleware/validation-middleware";
import { UserEventType } from "@ecommerce/common";
import { dispatchUserEvent } from "../service/outbox-dispatcher";
import { env } from "./env";

const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    redirectTo: "/",
    requireEmailVerification: true,
    autoSignInAfterVerification: true,
    sendResetPassword: async ({ user, token }) => {
      const url = `${env.CLIENT_URL}/reset-password/${token}`;
      void dispatchUserEvent(UserEventType.FORGOT_PASSWORD, user, {
        link: url,
      });
    },
    onPasswordReset: async ({ user }) => {
      console.log(`Password for user ${user.email} has been reset.`);
    },
    resetPasswordTokenExpiresIn: 1000 * 60 * 10,
  },
  baseURL: env.BASE_URL,

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 2,
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
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
        void dispatchUserEvent(
          UserEventType.REGISTERED,
          {
            ...user,
            email: newEmail,
          },
          { link: url },
        );
      },
      sendChangeEmailVerification: async ({ user }) => {
        void dispatchUserEvent(UserEventType.VERIFIED, user);
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
      console.log("sendVerificationEmail triggered for:", user.email);
      void dispatchUserEvent(UserEventType.REGISTERED, user, { link: url });
    },
    afterEmailVerification: async (user) => {
      void dispatchUserEvent(UserEventType.VERIFIED, user);
    },
  },

  trustedOrigins: [env.CLIENT_URL],
  databaseHooks: {
    user: {
      create: {
        after: async (_, ctx) => {
          ctx?.context.adapter;
        },
      },
    },
  },

  plugins: [openAPI()],
});

export default auth;
