import { Router } from "express";
import { adminController } from "../controller/admin-controller";

const adminAddressRouter = Router();

adminAddressRouter.get(
  "/addresses/search",
  adminController.listAllAddressesAdmin,
);
adminAddressRouter.get("/addresses/:id", adminController.getAddressById);
adminAddressRouter.delete("/addresses/:id", adminController.deleteAddress);

export { adminAddressRouter };
