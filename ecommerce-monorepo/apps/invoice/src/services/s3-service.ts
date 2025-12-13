import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "../config/env";

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export class S3Service {
  static async uploadInvoice(key: string, fileBuffer: Buffer): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: env.AWS_BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: "application/pdf",
    });

    await s3Client.send(command);
    return `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
  }

  static async getSignedDownloadUrl(fileKey: string) {
    const filename = fileKey.split("/").pop();

    const command = new GetObjectCommand({
      Bucket: env.AWS_BUCKET_NAME,
      Key: fileKey,
      ResponseContentDisposition: `attachment; filename="invoice-${filename}"`,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    return signedUrl;
  }
}
