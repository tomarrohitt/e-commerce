import { Request, Response } from "express";
import { addToCartSchema } from "../lib/cart-validation-schema";
import cartService from "../service/cart-service";

class CartController {
  async addToCart(req: Request, res: Response) {
    try {
      const { error, value } = addToCartSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        return res.status(400).json({
          error: error.details.map((detail) => ({
            field: detail.path[0],
            message: detail.message,
          })),
        });
      }

      await cartService.addItem(req.user.id, value.productId, value.quantity);

      res.status(201).json({
        message: "Item added to cart",
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      res.status(500).json({ error });
    }
  }
  async getCart(req: Request, res: Response) {
    try {
      const cart = await cartService.getCart(req.user.id);
      res.status(200).json(cart);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      res.status(500).json({ error });
    }
  }

  async updateCartItem(req: Request, res: Response) {
    try {
      const { error, value } = addToCartSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      await cartService.updateCartItem(
        req.user.id,
        req.params.productId,
        value.quantity
      );
      res.status(201).json({
        message: "Item updated in cart",
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      res.status(500).json({ error });
    }
  }
  async removeFromCart(req: Request, res: Response) {
    try {
      await cartService.removeFromCard(req.user.id, req.params.productId);
      res.status(204).json({
        message: "Item removed from cart",
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      res.status(500).json({ error });
    }
  }

  async clearCart(req: Request, res: Response) {
    try {
      await cartService.clearCart(req.user.id);
      res.status(204).json({
        message: "Cart cleared",
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      res.status(500).json({ error });
    }
  }

  async getCartCount(req: Request, res: Response) {
    try {
      const count = await cartService.getCartItemCount(req.user.id);
      res.status(200).json(count);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      res.status(500).json({ error });
    }
  }

  async validationCart(req: Request, res: Response) {
    try {
      const validation = await cartService.validateCart(req.user.id);
      res.status(200).json(validation);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      res.status(500).json({ error });
    }
  }
}

export default new CartController();
