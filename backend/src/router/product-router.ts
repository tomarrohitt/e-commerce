import { Router } from "express";
import { requireAuth } from "../middleware/auth-middleware";
import productController from "../controller/product-controller";

const productRouter = Router();

productRouter.get("/", requireAuth, productController.listProducts);
productRouter.post("/", requireAuth, productController.createProduct);
productRouter.delete("/:id", requireAuth, productController.deleteProduct);
productRouter.get("/:id", requireAuth, productController.getProduct);
productRouter.patch("/:id", requireAuth, productController.updateProduct);
productRouter.patch("/:id/stock", requireAuth, productController.updateStock);
productRouter.post(
  "/:id/get-upload-url",
  requireAuth,
  productController.getProductUploadUrls
);
productRouter.patch(
  "/:id/confirm-upload",
  requireAuth,
  productController.addImage
);

export default productRouter;
