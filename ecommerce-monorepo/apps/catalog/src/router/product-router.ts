import { Router } from "express";
import productController from "../controllers/product-controller";

const productRouter = Router();

productRouter.get("/", productController.listProducts);
productRouter.get("/:id", productController.getProduct);

productRouter.post("/", productController.createProduct);

productRouter.delete("/:id", productController.deleteProduct);
productRouter.patch("/:id", productController.updateProduct);
productRouter.patch("/:id/stock", productController.updateStock);
productRouter.post(
  "/:id/get-upload-url",
  productController.getProductUploadUrls,
);
productRouter.patch(
  "/:id/images-reorder",

  productController.reorderImages,
);
productRouter.patch(
  "/:id/confirm-upload",

  productController.addImage,
);

export default productRouter;
