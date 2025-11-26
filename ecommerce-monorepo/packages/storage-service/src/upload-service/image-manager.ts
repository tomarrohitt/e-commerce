import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { s3Client, AWS_BUCKET_NAME } from "../config/aws"; // Import from config

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const URL_EXPIRATION = 600; // 10 minutes

export enum StoragePrefix {
  USER_PROFILE = "uploads/user-profile",
  PRODUCT = "uploads/products",
}

// Internal helper
async function createPresignedPostConfig(key: string) {
  return await createPresignedPost(s3Client, {
    Bucket: AWS_BUCKET_NAME,
    Key: key,
    Conditions: [
      ["content-length-range", 0, MAX_FILE_SIZE],
      ["starts-with", "$Content-Type", "image/"],
    ],
    Fields: {
      "Content-Type": "image/*",
    },
    Expires: URL_EXPIRATION,
  });
}

export async function generatePresignedUrls(
  prefix: StoragePrefix,
  recordId: string,
  count: number = 1
) {
  const promises = Array.from({ length: count }, async (_, index) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e5)}`;

    // Naming convention: prefix/id/index_timestamp.webp
    const fileName = count > 1 ? `${index}_${uniqueSuffix}` : uniqueSuffix;
    const key = `${prefix}/${recordId}/${fileName}.webp`;

    const { url, fields } = await createPresignedPostConfig(key);

    return { url, fields, key };
  });

  const results = await Promise.all(promises);
  return count === 1 ? results[0] : results;
}

export async function deleteImage(key: string): Promise<boolean> {
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: key,
      })
    );
    return true;
  } catch (error) {
    // Log but don't crash - usually used in background cleanup
    console.error(`[Storage] Failed to delete image ${key}:`, error);
    return false;
  }
}

export async function deleteImages(
  keys: string[]
): Promise<{ deleted: string[]; failed: string[] }> {
  if (keys.length === 0) return { deleted: [], failed: [] };

  try {
    const response = await s3Client.send(
      new DeleteObjectsCommand({
        Bucket: AWS_BUCKET_NAME,
        Delete: {
          Objects: keys.map((key) => ({ Key: key })),
          Quiet: false, // Return list of deleted objects
        },
      })
    );

    const deleted =
      response.Deleted?.map((obj) => obj.Key!).filter(Boolean) || [];
    const failed =
      response.Errors?.map((err) => err.Key!).filter(Boolean) || [];

    return { deleted, failed };
  } catch (error) {
    console.error("[Storage] Failed to batch delete images:", error);
    return { deleted: [], failed: keys };
  }
}

export async function validateImagesExist(keys: string[]) {
  const checks = await Promise.all(
    keys.map(async (key) => {
      try {
        await s3Client.send(
          new HeadObjectCommand({
            Bucket: AWS_BUCKET_NAME,
            Key: key,
          })
        );
        return null; // Exists
      } catch {
        return key; // Does not exist
      }
    })
  );

  const missing = checks.filter((key): key is string => key !== null);

  if (missing.length > 0) {
    // 🛑 Throw Clean Error using your System
    throw new Error(
      `Validation failed: The following images were not uploaded: ${missing.join(", ")}`
    );
  }

  return true;
}
