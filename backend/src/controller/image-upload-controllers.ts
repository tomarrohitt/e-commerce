import { Request, Response } from "express";
import { imageUploadService } from "../service/image-upload-service";
import { fromNodeHeaders } from "better-auth/node";
import auth from "../config/auth";

export async function getUploadUrlController(req: Request, res: Response) {
  try {
    const { fileType, fileExtension } = req.body;

    if (!fileType || !fileExtension) {
      return res.status(400).json({
        error: "fileType and fileExtension are required",
      });
    }

    if (!fileType.startsWith("image/webp")) {
      return res.status(400).json({
        error: "Only image/webp files are allowed",
      });
    }

    const result = await imageUploadService(
      fileType,
      fileExtension,
      req.user.id,
    );

    return res.status(201).json({
      uploadUrl: result.url,
      fields: result.fields,
    });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return res.status(500).json({ error: "Failed to generate upload URL" });
  }
}

export async function confirmUploadController(req: Request, res: Response) {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({ error: "key is required" });
    }
    const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    await auth.api.updateUser({
      body: {
        image: imageUrl,
      },
      headers: fromNodeHeaders(req.headers),
    });

    res.json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    console.error("Error confirming upload:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
}
