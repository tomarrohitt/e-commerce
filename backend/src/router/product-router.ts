import { Router } from "express";
import { requireAuth } from "../middleware/auth-middleware";
import productController from "../controller/product-controller";

const productRouter = Router();

productRouter.get("/", requireAuth, productController.listProducts);
productRouter.post("/", requireAuth, productController.createProduct);
productRouter.delete("/:id", requireAuth, productController.deleteProduct);
productRouter.get("/:id", requireAuth, productController.getProduct);
productRouter.put("/:id", requireAuth, productController.updateProduct);
productRouter.patch("/:id/stock", requireAuth, productController.updateStock);
productRouter.patch("/:id/images", requireAuth, productController.addImage);

export default productRouter;
