import { Router } from "express";
import { adminController } from "../controller/admin-controller";

const adminUserRouter = Router();

adminUserRouter.get("/users/search", adminController.listUsers);
adminUserRouter.get("/users/:id", adminController.getUserById);
adminUserRouter.patch("/users/:id", adminController.updateUser);
adminUserRouter.delete("/users/:id", adminController.deleteUser);

export { adminUserRouter };
