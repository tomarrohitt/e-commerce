import { Router } from "express";
import { requireAuth } from "../middleware/auth-middleware";
import productController from "../controller/product-controller";

const productRouter = Router();

productRouter.get("/", requireAuth, productController.listProducts);
productRouter.post("/", requireAuth, productController.createProduct);
productRouter.delete("/:id", requireAuth, productController.deleteProduct);

export default productRouter;
