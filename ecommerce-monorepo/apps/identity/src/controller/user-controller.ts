import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { userEventLog } from "../events/user-event";
import { redis } from "@ecommerce/common";

class UserController {
  async update(req: Request, res: Response) {
    const { name } = req.body;

    try {
      const updatedUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: { id: req.user?.id },
          data: {
            name,
          },
        });

        // await userEventLog.queueUserUpdated(tx, {
        //   id: user.id,
        //   email: user.email,
        //   name: user.name,
        // });

        return user;
      });

      await redis.updateSessionData(req.user.sessionId, {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        image: updatedUser.image,
        sessionId: req.user.sessionId,
        name: updatedUser.name,
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Update profile failed:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  }
}

export const userController = new UserController();
