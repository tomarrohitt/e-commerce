import { Router } from "express";
import { confirmUpload, getUploadUrl } from "../controller/avatar-controller";
import { userController } from "../controller/user-controller";

export const userRouter: Router = Router();

userRouter.patch("/profile", userController.update);
userRouter.post("/get-upload-url", getUploadUrl);
userRouter.post("/confirm-upload", confirmUpload);

export default userRouter;
