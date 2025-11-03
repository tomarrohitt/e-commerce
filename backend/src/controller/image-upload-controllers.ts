import { Request, Response } from "express";
import {
  deleteImage,
  imageUploadService,
} from "../service/image-upload-service";
import { fromNodeHeaders } from "better-auth/node";
import auth from "../config/auth";

class ImageUploadController {
  async getUploadUrl(req: Request, res: Response) {
    try {
      const result = await imageUploadService(req.user.id);

      return res.status(201).json({
        uploadUrl: result.url,
        fields: result.fields,
      });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      return res.status(500).json({ error: "Failed to generate upload URL" });
    }
  }

  async confirmUpload(req: Request, res: Response) {
    try {
      const { key } = req.body;

      if (!key) {
        return res.status(400).json({ error: "key is required" });
      }

      if (req.user.image) {
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
        image: key,
      });
    } catch (error) {
      console.error("Error confirming upload:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  }
}

export default new ImageUploadController();
