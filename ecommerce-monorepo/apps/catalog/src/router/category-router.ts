import { Router } from "express";
import categoryController from "../controllers/category-controller";

const categoryRouter = Router();

categoryRouter.get("/", categoryController.listCategories);
categoryRouter.get("/:id", categoryController.getCategoryById);

//ADMIN ONLY
categoryRouter.post("/", categoryController.createCategory);
categoryRouter.delete("/:id", categoryController.deleteCategory);
categoryRouter.patch("/:id", categoryController.updateCategory);

export default categoryRouter;
