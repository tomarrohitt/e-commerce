import { Router } from "express";
import categoryController from "../controllers/category-controller";

const categoryRouter = Router();

categoryRouter.get("/", categoryController.listCategories);
categoryRouter.get("/:id", categoryController.getCategoryById);

export default categoryRouter;
