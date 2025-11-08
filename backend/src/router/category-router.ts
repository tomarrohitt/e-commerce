import { Router } from "express";
import { requireAdmin, requireAuth } from "../middleware/auth-middleware";
import categoryController from "../controller/category-controller";

const categoryRouter = Router();

categoryRouter.get("/", categoryController.listCategories);
categoryRouter.get("/:id", categoryController.getCategoryById);
categoryRouter.get("/slug/:slug", categoryController.getCategoryBySlug);

categoryRouter.use(requireAuth, requireAdmin);

categoryRouter.post("/", categoryController.createCategory);
categoryRouter.delete("/:id", categoryController.deleteCategory);
categoryRouter.patch("/:id", categoryController.updateCategory);

export default categoryRouter;
