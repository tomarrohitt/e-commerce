import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { User } from "better-auth/types";
import { config } from "../config/index";

const MAX_FILE_SIZE = 2 * 1024 * 1024;

export async function imageUploadService(
  fileType: string,
  fileExtension: string,
  userId: string,
) {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e5);
  const key = `uploads/profile-images/${userId}/${uniqueSuffix}.${fileExtension}`;

  const { url, fields } = await createPresignedPost(config.s3Client, {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    Conditions: [
      ["content-length-range", 0, MAX_FILE_SIZE],
      ["starts-with", "$Content-Type", "image/webp"],
    ],
    Fields: {
      "Content-Type": fileType,
    },
    Expires: 60,
  });

  return { url, fields };
}
