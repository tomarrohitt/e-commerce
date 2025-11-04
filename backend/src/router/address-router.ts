import { Router } from "express";
import { requireAdmin, requireAuth } from "../middleware/auth-middleware";
import addressController from "../controller/address-controller";

const addressRouter = Router();

addressRouter.use(requireAuth);

addressRouter.get("/", addressController.listAddress);
addressRouter.post("/", addressController.createAddress);

addressRouter.get("/:id/user", addressController.getAddressById);
addressRouter.get("/user", addressController.findByUserId);
addressRouter.delete("/:id", addressController.deleteAddress);
addressRouter.patch("/:id", addressController.updateAddress);

addressRouter.patch("/:id/default", addressController.setDefaultAddress);
addressRouter.get("/:id/default", addressController.getDefaultAddress);

export default addressRouter;
