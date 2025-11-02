import { Router } from "express";
import { requireAuth } from "../middleware/auth-middleware";
import productController from "../controller/product-controller";

const productRouter = Router();

productRouter.post("/create", requireAuth, productController.createProduct);

export default productRouter;
