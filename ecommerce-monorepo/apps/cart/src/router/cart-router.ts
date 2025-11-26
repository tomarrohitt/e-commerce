import { Router } from "express";
import cartController from "../controller/cart-controller";

const cartRouter = Router();

cartRouter.post("/", cartController.addToCart);
cartRouter.get("/", cartController.getCart);
cartRouter.get("/count", cartController.getCartCount);
cartRouter.get("/validate", cartController.validationCart);
cartRouter.patch("/:productId", cartController.updateCartItem);
cartRouter.delete("/:productId", cartController.removeFromCart);
cartRouter.delete("/", cartController.clearCart);

export default cartRouter;
