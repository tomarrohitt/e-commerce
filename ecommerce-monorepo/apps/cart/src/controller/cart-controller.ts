import { Request, Response } from "express";
import {
  addToCartSchema,
  updateQuantitySchema,
  AddToCartInput,
  UpdateQuantityInput,
} from "../lib/validation-schema";
import cartService from "../service/cart-service";
import {
  BadRequestError,
  sendNoContent,
  sendSuccess,
  validateAndThrow,
} from "@ecommerce/common";

class CartController {
  async addToCart(req: Request, res: Response) {
    const { productId, quantity } = validateAndThrow<AddToCartInput>(
      addToCartSchema,
      req.body
    );

    const userId = req.user.id;

    await cartService.addItem(userId, productId, quantity);

    return sendSuccess(res, null, "Item added to cart");
  }

  // GET /api/cart
  async getCart(req: Request, res: Response) {
    const userId = req.user.id;
    const cart = await cartService.getCart(userId);

    return sendSuccess(res, cart);
  }

  async updateCartItem(req: Request, res: Response) {
    const { quantity } = validateAndThrow<UpdateQuantityInput>(
      updateQuantitySchema,
      req.body
    );
    const userId = req.user.id;
    const productId = req.params.productId;

    if (!productId) {
      throw new BadRequestError("Product ID is required");
    }

    await cartService.updateCartItem(userId, productId, quantity);

    return sendSuccess(res, null, "Item update in cart");
  }

  async removeFromCart(req: Request, res: Response) {
    const userId = req.user.id;
    const productId = req.params.productId;

    if (!productId) {
      throw new BadRequestError("Product ID is required");
    }

    await cartService.removeFromCard(userId, productId);

    return sendNoContent(res);
  }

  async validationCart(req: Request, res: Response) {
    const userId = req.user.id;

    const validation = await cartService.validateCart(userId);

    return sendSuccess(res, validation);
  }

  async clearCart(req: Request, res: Response) {
    const userId = req.user.id;
    await cartService.clearCart(userId);

    return sendNoContent(res);
  }

  async getCartCount(req: Request, res: Response) {
    const userId = req.user.id;
    const count = await cartService.getCartItemCount(userId);

    return sendSuccess(res, { count });
  }
}

export default new CartController();
