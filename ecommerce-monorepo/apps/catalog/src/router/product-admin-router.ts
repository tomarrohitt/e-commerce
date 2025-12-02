import { Router } from "express";
import productController from "../controllers/product-controller";

const productAdminRouter = Router();

productAdminRouter.post("/", productController.createProduct);

productAdminRouter.delete("/:id", productController.deleteProduct);
productAdminRouter.patch("/:id", productController.updateProduct);
productAdminRouter.patch("/:id/stock", productController.updateStock);
productAdminRouter.post(
  "/:id/get-upload-url",
  productController.getProductUploadUrls,
);
productAdminRouter.patch(
  "/:id/images-reorder",

  productController.reorderImages,
);
productAdminRouter.patch(
  "/:id/confirm-upload",

  productController.addImage,
);

export default productAdminRouter;
