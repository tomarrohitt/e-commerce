import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { authHooks } from "../middleware/validation-middleware";
import { EventType } from "@prisma/client";
// import { eventPublisher } from "../events/publisher"; // TODO: Re-implement with RabbitMQ later

const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      // await sendEmail({
      //   to: user.email,
      //   subject: "Reset your password",
      //   text: `Click the link to reset your password: ${url}`,
      // });
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
    autoSignInAfterVerification: true,
    expiresIn: 86400,
    sendVerificationEmail: async ({ user, url }) => {
      const newUrl = url.split("&")[0] + "&callbackURL=/";

      await prisma.outboxEvent.create({
        data: {
          aggregateId: user.id,
          eventType: EventType.USER_REGISTERED,
          payload: {
            userId: user.id,
            name: user.name,
            email: user.email,
            verificationLink: newUrl,
          },
        },
      });

      console.log("TODO: Publish RabbitMQ Event: USER_REGISTERED", {
        email: user.email,
        link: newUrl,
      });
    },
  },
  trustedOrigins: [process.env.CLIENT_URL || ""],
  // rateLimit: {
  //   window: 60,
  //   max: 100,
  //   customRules: {
  //     "/sign-in/email": {
  //       window: 10,
  //       max: 3,
  //     },
  //     "/sign-up/email": {
  //       window: 10,
  //       max: 3,
  //     },
  //   },
  // },
});

export default auth;
