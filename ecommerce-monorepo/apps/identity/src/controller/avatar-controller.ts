import { Request, Response } from "express";
import { avatarService } from "../service/avatar-service";
import { BadRequestError, NotFoundError } from "@ecommerce/common";
import { prisma } from "../config/prisma";

export const getUploadUrl = async (req: Request, res: Response) => {
  const user = (req as any).user;

  if (!user) throw new NotFoundError("User not found");

  const result = await avatarService.getAvatarUploadUrl(user.id);

  res.status(200).json({
    uploadUrl: result.url,
    fields: result.fields,
    key: result.key,
  });
};

export const confirmUpload = async (req: Request, res: Response) => {
  const { key } = req.body;

  // 2. CAST TO ANY
  const user = (req as any).user;

  if (!user) throw new NotFoundError("User not found");

  const userId = user.id;

  if (!userId) throw new NotFoundError("User not found");
  if (!key) throw new BadRequestError("Key is required");

  // 1. Security Check: Ensure the key belongs to this user folder
  if (!key.includes(userId)) {
    throw new BadRequestError("Invalid image key for this user");
  }

  // 2. Verify file exists in S3
  const exists = await avatarService.validateImageExists(key);
  if (!exists) {
    throw new BadRequestError("Image upload failed or file not found");
  }

  // 3. Delete old image if it exists
  if (user.image) {
    // Fire and forget - don't await this
    avatarService.deleteImage(user.image).catch(console.error);
  }

  // 4. Update User in DB
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { image: key },
  });

  // 5. TODO: Publish event (We will add this later)

  res.json({
    success: true,
    image: updatedUser.image,
  });
};
