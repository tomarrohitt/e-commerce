import { Router } from "express";
import productController from "../controllers/product-controller";

const productRouter = Router();

productRouter.get("/", productController.listProducts);
productRouter.get("/:id", productController.getProduct);

export default productRouter;
