import { Request, Response } from "express";
import {
  addToCartSchema,
  updateQuantitySchema,
  AddToCartInput,
  UpdateQuantityInput,
} from "../lib/validation-schema";
import cartService from "../service/cart-service";
import { BadRequestError, validateAndThrow } from "@ecommerce/common";

class CartController {
  // POST /api/cart
  async addToCart(req: Request, res: Response) {
    const { productId, quantity } = validateAndThrow<AddToCartInput>(
      addToCartSchema,
      req.body,
    );

    const userId = req.user.id;

    await cartService.addItem(userId, productId, quantity);

    res.status(201).json({
      success: true,
      message: "Item added to cart",
    });
  }

  // GET /api/cart
  async getCart(req: Request, res: Response) {
    const userId = req.user.id;
    const cart = await cartService.getCart(userId);

    res.status(200).json({
      success: true,
      data: cart,
    });
  }

  async updateCartItem(req: Request, res: Response) {
    const { quantity } = validateAndThrow<UpdateQuantityInput>(
      updateQuantitySchema,
      req.body,
    );
    const userId = req.user.id;
    const productId = req.params.productId;

    if (!productId) {
      throw new BadRequestError("Product ID is required");
    }

    await cartService.updateCartItem(userId, productId, quantity);

    res.status(200).json({
      success: true,
      message: "Cart item updated",
    });
  }

  async removeFromCart(req: Request, res: Response) {
    const userId = req.user.id;
    const productId = req.params.productId;

    if (!productId) {
      throw new BadRequestError("Product ID is required");
    }

    await cartService.removeFromCard(userId, productId);

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
    });
  }

  async validationCart(req: Request, res: Response) {
    const userId = req.user.id;

    const validation = await cartService.validateCart(userId);

    res.status(200).json({
      success: true,
      data: validation,
    });
  }

  async clearCart(req: Request, res: Response) {
    const userId = req.user.id;
    await cartService.clearCart(userId);

    res.status(204).json({
      success: true,
      message: "Cart cleared",
    });
  }

  async getCartCount(req: Request, res: Response) {
    const userId = req.user.id;
    const count = await cartService.getCartItemCount(userId);

    res.status(200).json({
      success: true,
      data: { count },
    });
  }
}

export default new CartController();
