import { Router } from "express";
import { requireAdmin, requireAuth } from "../middleware/auth-middleware";
import productController from "../controller/product-controller";

const productRouter = Router();

productRouter.use(requireAuth);

productRouter.get("/", productController.listProducts);
productRouter.get("/:id", productController.getProduct);

// productRouter.use(requireAdmin);

productRouter.post("/", productController.createProduct);
productRouter.delete("/:id", productController.deleteProduct);
productRouter.patch("/:id", productController.updateProduct);
productRouter.patch("/:id/stock", productController.updateStock);
productRouter.post(
  "/:id/get-upload-url",

  productController.getProductUploadUrls
);
productRouter.patch(
  "/:id/confirm-upload",

  productController.addImage
);

export default productRouter;
