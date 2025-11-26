import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { prisma } from "./prisma";
import { authHooks } from "../middleware/validation-middleware";
import { eventPublisher, EventType } from "../events/publisher";
import { randomUUID } from "crypto";
import { config } from ".";

const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 * 60,
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  hooks: authHooks,

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 86400,
    sendVerificationEmail: async ({ user, url }) => {
      const newUrl =
        url.split("&")[0] + "&callbackURL=http://localhost:3000/dashboard";

      await eventPublisher.publish({
        eventId: randomUUID(),
        eventType: EventType.USER_REGISTERED,
        timestamp: new Date(),
        userId: user.id,
        data: {
          name: user.name,
          email: user.email,
          verificationLink: newUrl,
        },
      });
    },
  },
  trustedOrigins: [config.clientUrl],
});

export default auth;
export type Session = typeof auth.$Infer.Session;
