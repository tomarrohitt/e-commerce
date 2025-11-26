import { Router } from "express";
import { adminController } from "../controller/admin-controller";

const adminRouter = Router();

adminRouter.get("/addresses/search", adminController.listAllAddressesAdmin);
adminRouter.get("/addresses/:id", adminController.getAddressById);
adminRouter.delete("/addresses/:id", adminController.deleteAddress);

adminRouter.get("/users/search", adminController.listUsers);
adminRouter.get("/users/:id", adminController.getUserById);
adminRouter.patch("/users/:id", adminController.updateUser);
adminRouter.delete("/users/:id", adminController.deleteUser);

export { adminRouter };
