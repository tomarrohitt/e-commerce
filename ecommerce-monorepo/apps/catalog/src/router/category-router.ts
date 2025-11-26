import { Router } from "express";
import categoryController from "../controllers/category-controller";

const categoryRouter = Router();

categoryRouter.get("/", categoryController.listCategories);
categoryRouter.get("/:id", categoryController.getCategoryById);

categoryRouter.post("/", categoryController.createCategory);
categoryRouter.delete("/:id", categoryController.deleteCategory);
categoryRouter.patch("/:id", categoryController.updateCategory);

export default categoryRouter;
