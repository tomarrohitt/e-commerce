import { Router } from "express";
import addressController from "../controller/address-controller";
import { requireAdmin, requireAuth } from "../middleware/auth-middleware";

const adminAddressRouter = Router();

adminAddressRouter.use(requireAuth, requireAdmin);

adminAddressRouter.get("/", addressController.listAllAddresses);
adminAddressRouter.get("/user/:userId", addressController.findByUserIdAdmin);
adminAddressRouter.patch(
  "/user/:userId/set-default/:addressId",
  addressController.setDefaultAddressForUser
);

export default adminAddressRouter;
