import "dotenv/config";
import { z, ZodType } from "zod";

export function validateEnv<T>(schema: ZodType<T>): T {
  const parsed = schema.safeParse(process.env);

  if (parsed.error) {
    console.error("Invalid environment variables:");
    console.log({ errors: parsed.error });
    process.exit(1);
  }

  return parsed.data;
}

export const commonEnv = {
  PORT: z.coerce.number(),
  DATABASE_URL: z.string().optional(),
  CLIENT_URL: z.string().optional().default("http://localhost:3000"),

  BASE_URL: z.string().optional().default("http://localhost"),
  REDIS_URL: z.string().optional().default("redis://localhost:6379/0"),
  RABBITMQ_URL: z
    .string()
    .optional()
    .default("amqp://rabbitmq:password@localhost:5672"),
};

export const secretUrlEnv = {
  INTERNAL_SERVICE_SECRET: z.string().min(3),
  BETTER_AUTH_SECRET: z.string().min(3).optional(),
  BETTER_AUTH_URL: z.string().optional(),
};

export const servicesUrlEnv = {
  IDENTITY_SERVICE_URL: z.string(),
  CATALOG_SERVICE_URL: z.string(),
  CART_SERVICE_URL: z.string(),
  ORDERS_SERVICE_URL: z.string(),
  INTERNAL_SERVICE_SECRET: z.string(),
};

export const awsEnv = {
  AWS_REGION: z.string().min(3),
  AWS_BUCKET_NAME: z.string().min(3),
  AWS_ACCESS_KEY_ID: z.string().min(3),
  AWS_SECRET_ACCESS_KEY: z.string().min(3),
};
export const emailEnv = {
  SMTP_HOST: z.string().min(3),
  SMTP_SECURE: z.string().default("true"),
  SMTP_PORT: z.string().min(1).default("587"),
  SMTP_USER: z.string().min(3),
  SMTP_PASS: z.string().min(3),
  SMTP_FROM: z.string().min(3),
};

export const stripeEnv = {
  STRIPE_SECRET_KEY: z.string().min(3),
  STRIPE_WEBHOOK_SECRET: z.string().min(3),
  STRIPE_PUBLISHABLE_KEY: z.string().min(3),
};
