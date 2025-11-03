import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { prisma } from "./prisma";
import { authHooks } from "../middleware/validation-middleware";

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
      enabled: false,
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
      console.log(`Send verification email to ${user.email}: ${url}`);
    },
  },

  // secondaryStorage: {
  // 	get: async (key) => {
  // 		return await redis.get(key);
  // 	},
  // 	set: async (key, value, ttl) => {
  // 		// TTL in seconds — convert ms with ttl * 1000.
  // 		if (ttl) await redis.set(key, value, { EX: ttl });
  // 		// or for ioredis:
  // 		// if (ttl) await redis.set(key, value, 'EX', ttl)
  // 		else await redis.set(key, value);
  // 	},
  // 	delete: async (key) => {
  // 		await redis.del(key);
  // 	}
  // }
});

export default auth;
export type Session = typeof auth.$Infer.Session;
