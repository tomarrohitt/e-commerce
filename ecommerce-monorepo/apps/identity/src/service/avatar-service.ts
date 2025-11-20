import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME } from "../config/aws";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export class AvatarService {
  async getAvatarUploadUrl(userId: string) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e5);
    const key = `uploads/user-profile/${userId}/${uniqueSuffix}.webp`;

    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: BUCKET_NAME,
      Key: key,
      Conditions: [
        ["content-length-range", 0, MAX_FILE_SIZE],
        ["starts-with", "$Content-Type", "image/"],
      ],
      Fields: {
        "Content-Type": "image/webp",
      },
      Expires: 600,
    });

    return { url, fields, key };
  }

  async validateImageExists(key: string): Promise<boolean> {
    try {
      await s3Client.send(
        new HeadObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
        })
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  async deleteImage(key: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(command);
      return true;
    } catch (error) {
      console.error(`Failed to delete image ${key}:`, error);
      return false;
    }
  }
}

export const avatarService = new AvatarService();
