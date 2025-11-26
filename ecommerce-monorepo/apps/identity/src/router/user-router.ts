import { Request, Response, Router } from "express";
import imageUploadController from "../controller/avatar-controller";
import { userController } from "../controller/user-controller";

export const userRouter: Router = Router();

userRouter.patch("/profile", userController.update);

userRouter.post("/get-upload-url", imageUploadController.getUploadUrl);

userRouter.post("/confirm-upload", imageUploadController.confirmUpload);

export default userRouter;
