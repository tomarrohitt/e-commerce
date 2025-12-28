import { Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import auth from "../config/auth";
import {
  deleteImage,
  generatePresignedUrls,
  StoragePrefix,
} from "@ecommerce/storage-service";
import { BadRequestError, sendCreated, sendSuccess } from "@ecommerce/common";

class ImageUploadController {
  async getUploadUrl(req: Request, res: Response) {
    if (!req.user || !req.user.id) {
      throw new BadRequestError("User ID missing from request context.");
    }
    const result = (await generatePresignedUrls(
      StoragePrefix.USER_PROFILE,
      req.user.id
    )) as { url: string; fields: Record<string, string>; key: string };

    const data = {
      uploadUrl: result.url,
      fields: result.fields,
    };

    return sendSuccess(res, data);
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

    sendCreated(res, { image: key }, "Profile image updated successfully.");
  }
}

export default new ImageUploadController();
