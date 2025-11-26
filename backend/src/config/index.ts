import "dotenv/config";
import { S3Client } from "@aws-sdk/client-s3";
import Stripe from "stripe";
import nodemailer from "nodemailer";

export const config = {
  port: process.env.PORT,
  clientUrl: process.env.CLIENT_URL as string,
  jwtSecret: process.env.JWT_SECRET as string,
  redisUrl: process.env.REDIS_URL as string,
  emailProvider: nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT!),
    secure: false,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  }),
  s3Client: new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  }),
  stripe: new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-11-17.clover",
  }),
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
};
