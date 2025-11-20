import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { authHooks } from "../middleware/validation-middleware";
// import { eventPublisher } from "../events/publisher"; // TODO: Re-implement with RabbitMQ later
import { EventType } from "@generated/identity";

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
      maxAge: 24 * 60 * 60,
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

      // TODO: Replace with RabbitMQ Publisher
      /*
      await eventPublisher.publish({
        eventType: EventType.USER_REGISTERED,
        userId: user.id,
        data: { name: user.name, email: user.email, verificationLink: newUrl },
      });
      */
    },
  },
  trustedOrigins: [process.env.CLIENT_URL || "http://localhost:3000"],
});

export default auth;
