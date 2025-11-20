import { Request, Response } from "express";
import { prisma } from "../config/prisma"; // Ensure path is correct relative to file
import { userEventLog } from "../events/user-event"; // Ensure path is correct

class UserController {
  async update(req: Request, res: Response) {
    try {
      const { name, image } = req.body;

      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const updatedUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: { id: userId },
          data: {
            name,
            image,
          },
        });

        await userEventLog.queueUserUpdated(tx, {
          id: user.id,
          email: user.email,
          name: user.name,
        });

        return user;
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Update profile failed:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  }
}

export const userController = new UserController();
