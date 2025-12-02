import { Router } from "express";
import categoryController from "../controllers/category-controller";

const categoryAdminRouter = Router();

categoryAdminRouter.post("/", categoryController.createCategory);
categoryAdminRouter.delete("/:id", categoryController.deleteCategory);
categoryAdminRouter.patch("/:id", categoryController.updateCategory);

export default categoryAdminRouter;
