import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { config } from "../config/index";
import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function imageUploadService(userId: string) {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e5);
  const key = `uploads/user-profile/${userId}/${uniqueSuffix}.webp`;

  const { url, fields } = await createPresignedPost(config.s3Client, {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    Conditions: [
      ["content-length-range", 0, MAX_FILE_SIZE],
      ["starts-with", "$Content-Type", "image/"],
    ],
    Fields: {
      "Content-Type": "image/*",
    },
    Expires: 600,
  });

  return { url, fields };
}

export async function generateMultipleUrls(productId: string, count: number) {
  const uploadPromises = Array.from({ length: count }, async (_, index) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e5);
    const key = `uploads/products/${productId}/${index + "_" + uniqueSuffix}.webp`;

    const { url, fields } = await createPresignedPost(config.s3Client, {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      Conditions: [
        ["content-length-range", 0, MAX_FILE_SIZE],
        ["starts-with", "$Content-Type", "image/"],
      ],
      Fields: {
        "Content-Type": "image/*",
      },
      Expires: 600,
    });

    return {
      url,
      fields,
    };
  });

  return await Promise.all(uploadPromises);
}

export async function validateImagesExist(keys: string[]) {
  const validationPromises = keys.map(async (key) => {
    try {
      await config.s3Client.send(
        new HeadObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: key,
        })
      );
      return { key, exists: true };
    } catch (error) {
      return { key, exists: false };
    }
  });

  const results = await Promise.all(validationPromises);
  const missingImages = results.filter((r) => !r.exists);

  if (missingImages.length > 0) {
    throw new Error(
      `Some images were not uploaded: ${missingImages.map((m) => m.key).join(", ")}`
    );
  }

  return true;
}

export async function deleteImage(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
    });

    const result = await config.s3Client.send(command);
    console.log(`Deleted image: ${key}`, { result });
    return true;
  } catch (error) {
    console.error(`Failed to delete image ${key}:`, error);
    return false;
  }
}

export async function deleteImages(
  keys: string[]
): Promise<{ deleted: string[]; failed: string[] }> {
  if (keys.length === 0) return { deleted: [], failed: [] };

  try {
    const command = new DeleteObjectsCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
        Quiet: false,
      },
    });

    const response = await config.s3Client.send(command);

    const deleted =
      response.Deleted?.map((obj) => obj.Key!).filter(Boolean) || [];
    const failed =
      response.Errors?.map((err) => err.Key!).filter(Boolean) || [];

    console.log(`Deleted ${deleted.length} images, ${failed.length} failed`);
    return { deleted, failed };
  } catch (error) {
    console.error("Failed to delete images:", error);
    return { deleted: [], failed: keys };
  }
}
