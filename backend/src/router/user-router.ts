import { Router } from "express";
import { requireAuth } from "../middleware/auth-middleware";

import  imageUploadController from "../controller/image-upload-controllers";


const userRouter = Router();

userRouter.post("/get-upload-url", requireAuth, imageUploadController.getUploadUrl);
userRouter.post("/confirm-upload", requireAuth, imageUploadController.confirmUpload);

export default userRouter;
