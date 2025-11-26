import { Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import auth from "../config/auth";
import {
  deleteImage,
  generatePresignedUrls,
  StoragePrefix,
} from "@ecommerce/storage-service";
import { BadRequestError } from "@ecommerce/common";

class ImageUploadController {
  async getUploadUrl(req: Request, res: Response) {
    if (!req.user || !req.user.id) {
      throw new BadRequestError("User ID missing from request context.");
    }
    const result = (await generatePresignedUrls(
      StoragePrefix.USER_PROFILE,
      req.user.id
    )) as { url: string; fields: Record<string, string>; key: string };

    return res.status(200).json({
      success: true,
      message: "Presigned URL generated successfully.",
      data: {
        uploadUrl: result.url,
        fields: result.fields,
      },
    });
  }

  async confirmUpload(req: Request, res: Response) {
    const { key } = req.body;

    if (!key) {
      throw new BadRequestError("Image key is required in the body.");
    }

    if (req.user?.image) {
      deleteImage(req.user.image);
    }
    await auth.api.updateUser({
      body: {
        image: key,
      },
      headers: fromNodeHeaders(req.headers),
    });

    res.json({
      success: true,
      message: "Profile image updated successfully.",
      data: { image: key },
    });
  }
}

export default new ImageUploadController();
