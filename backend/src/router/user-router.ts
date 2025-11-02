import { Router } from "express";
import { requireAuth } from "../middleware/auth-middleware";
import {
  confirmUploadController,
  getUploadUrlController,
} from "../controller/image-upload-controllers";

const userRouter = Router();

userRouter.post("/get-upload-url", requireAuth, getUploadUrlController);
userRouter.post("/confirm-upload", requireAuth, confirmUploadController);

export default userRouter;
