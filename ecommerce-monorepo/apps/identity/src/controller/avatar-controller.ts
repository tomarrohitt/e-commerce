import { Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import auth from "../config/auth";
import {
  generatePresignedUrls,
  StoragePrefix,
} from "@ecommerce/storage-service";
import {
  BadRequestError,
  sendCreated,
  sendSuccess,
  UserEventType,
} from "@ecommerce/common";
import { IdentityAuthMiddleware } from "../middleware/auth-middleware";
import { dispatchUserEvent } from "../service/outbox-dispatcher";

class ImageUploadController {
  async getUploadUrl(req: Request, res: Response) {
    if (!req.user || !req.user.id) {
      throw new BadRequestError("User ID missing from request context.");
    }
    const result = (await generatePresignedUrls(
      StoragePrefix.USER_PROFILE,
      req.user.id,
    )) as { url: string; fields: Record<string, string>; key: string };

    const data = {
      uploadUrl: result.url,
      fields: result.fields,
    };

    return sendSuccess(res, data);
  }

  async confirmUpload(req: Request, res: Response) {
    if (!req.user || !req.user.id) {
      throw new BadRequestError("User ID missing from request context.");
    }
    try {
      const { key } = req.body;

      if (!key) {
        throw new BadRequestError("Image key is required in the body.");
      }

      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (session && session.user?.image) {
        await dispatchUserEvent(UserEventType.IMAGE_UPDATED, session.user, {
          image: session.user.image,
        });
      }

      await Promise.all([
        auth.api.updateUser({
          body: {
            image: key,
          },
          headers: fromNodeHeaders(req.headers),
        }),
        IdentityAuthMiddleware.validateToken(req.headers),
      ]);

      sendCreated(res, { image: key }, "Profile image updated successfully.");
    } catch (error) {
      console.log(error);
    }
  }
}

export default new ImageUploadController();
