import { Router } from "express";
import { requireAuth } from "../middleware/auth-middleware";
import addressController from "../controller/address-controller";

const addressRouter = Router();

addressRouter.use(requireAuth);

addressRouter.post("/", addressController.createAddress);

addressRouter.get("/", addressController.findByUserId);
addressRouter.get("/count", addressController.getAddressCount);

addressRouter.get("/default", addressController.getDefaultAddress);

addressRouter.get("/:id", addressController.getAddressById);

addressRouter.patch("/:id", addressController.updateAddress);

addressRouter.delete("/:id", addressController.deleteAddress);

addressRouter.patch("/:id/default", addressController.setDefaultAddress);

export default addressRouter;
