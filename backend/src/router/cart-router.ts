import { Router } from "express";
import cartController from "../controller/cart-controller";
import { requireAuth } from "../middleware/auth-middleware";

const cartRouter = Router();

cartRouter.use(requireAuth);

cartRouter.post("/", cartController.addToCart);
cartRouter.get("/", cartController.getCart);
cartRouter.get("/count", cartController.getCartCount);
cartRouter.get("/validate", cartController.validationCart);
cartRouter.put("/:productId", cartController.updateCartItem);
cartRouter.delete("/:productId", cartController.removeFromCart);
cartRouter.delete("/", cartController.clearCart);

export default cartRouter;
