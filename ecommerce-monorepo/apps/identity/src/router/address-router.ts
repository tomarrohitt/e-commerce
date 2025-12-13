import { Router } from "express";
import { addressController } from "../controller/address-controller";
import { asyncHandler } from "@ecommerce/common";
const addressRouter = Router();

addressRouter.post("/", asyncHandler(addressController.createAddress));
addressRouter.get("/", asyncHandler(addressController.listAddresses));
addressRouter.get(
  "/default",
  asyncHandler(addressController.getDefaultAddress)
);
addressRouter.get("/count", asyncHandler(addressController.getAddressCount));
addressRouter.get("/:id", asyncHandler(addressController.getAddressById));
addressRouter.patch("/:id", asyncHandler(addressController.updateAddress));
addressRouter.delete("/:id", asyncHandler(addressController.deleteAddress));
addressRouter.patch(
  "/:id/default",
  asyncHandler(addressController.setDefaultAddress)
);

export { addressRouter };
