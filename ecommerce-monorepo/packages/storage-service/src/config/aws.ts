import { S3Client } from "@aws-sdk/client-s3";

// 1. Validate Env Vars immediately
const requiredEnv = [
  "AWS_REGION",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_BUCKET_NAME",
];

const missing = requiredEnv.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(`Missing required AWS variables: ${missing.join(", ")}`);
}

// 2. Export the Client
export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Export bucket name safely
export const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME!;
