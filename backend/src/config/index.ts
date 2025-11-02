import "dotenv/config";
import { S3Client } from "@aws-sdk/client-s3";

export const config = {
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET as string,
  redisUrl: process.env.REDIS_URL as string,
  s3Client: new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  }),
};
