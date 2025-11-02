import { Router } from "express";
import { requireAuth } from "../middleware/auth-middleware";
import categoryController from "../controller/category-controller";

const categoryRouter = Router();

categoryRouter.get("/", requireAuth, categoryController.listCategories);
categoryRouter.post("/", requireAuth, categoryController.createCategory);
categoryRouter.delete("/:id", requireAuth, categoryController.deleteCategory);

export default categoryRouter;
