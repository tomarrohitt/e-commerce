import {
  CartItemWithProduct,
  BadRequestError,
  NotFoundError,
} from "@ecommerce/common";
import cartRepository from "../repository/cart-repository";
import productReplicasRepository from "../repository/product-replicas-repository";
import { env } from "../config/env";

class CartService {
  async addItem(userId: string, productId: string, quantity: number) {
    const product = await productReplicasRepository.findbyId(productId);

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    if (!product.isActive) {
      throw new BadRequestError("Product is not available");
    }

    if (quantity > product.stockQuantity) {
      throw new BadRequestError(
        `We only have ${product.stockQuantity} items in stockQuantity.`,
      );
    }

    const existingItem = await cartRepository.getItem(userId, productId);

    if (existingItem) {
      const newTotalQuantity = existingItem.quantity + quantity;
      if (newTotalQuantity > product.stockQuantity) {
        const remainingAllowed = product.stockQuantity - existingItem.quantity;

        if (remainingAllowed <= 0) {
          throw new BadRequestError(
            `You already have the maximum available stockQuantity (${product.stockQuantity}) in your cart.`,
          );
        }

        throw new BadRequestError(
          `You have ${existingItem.quantity} in your cart. You can only add ${remainingAllowed} more.`,
        );
      }

      await cartRepository.updateQuantity(userId, productId, newTotalQuantity);
    } else {
      await cartRepository.addItem(userId, productId, quantity);
    }
  }

  async getCart(userId: string) {
    const cartItems = await cartRepository.getAllItems(userId);

    if (cartItems.length === 0) {
      return {
        items: [],
        totalItems: 0,
        subtotal: 0,
        tax: 0,
        totalAmount: 0,
      };
    }

    const productIds = cartItems.map((item) => item.productId);
    const products = await productReplicasRepository.findByIds(productIds);
    const productMap = new Map(products.map((p) => [p.id, p]));

    const items: CartItemWithProduct[] = [];

    let subtotal = 0;
    let totalItems = 0;

    for (const cartItem of cartItems) {
      const product = productMap.get(cartItem.productId);

      if (!product) {
        await cartRepository.removeItem(userId, cartItem.productId);
        continue;
      }

      if (product.stockQuantity === 0) {
        items.push({
          ...cartItem,
          product: {
            id: product.id,
            name: product.name,
            price: product.price.toNumber(),
            thumbnail: product.thumbnail ? product.thumbnail : "",
            stockQuantity: product.stockQuantity,
          },
        });
        continue;
      }

      let quantity = cartItem.quantity;
      if (product.stockQuantity < quantity) {
        quantity = product.stockQuantity;
        await cartRepository.updateQuantity(
          userId,
          cartItem.productId,
          quantity,
        );
      }

      const itemTotal = product.price.toNumber() * quantity;

      items.push({
        productId: cartItem.productId,
        quantity,
        addedAt: cartItem.addedAt,
        product: {
          id: product.id,
          name: product.name,
          price: product.price.toNumber(),
          stockQuantity: product.stockQuantity,
          thumbnail: product.thumbnail ? product.thumbnail : "",
        },
      });

      subtotal += itemTotal;
      totalItems = items.length;
    }

    const tax = Math.round(subtotal * env.TAX_RATE * 100) / 100;

    const totalAmount = subtotal + tax;

    return {
      items,
      totalItems,
      subtotal: subtotal.toFixed(2),
      tax,
      totalAmount,
    };
  }

  async updateCartItem(userId: string, productId: string, quantity: number) {
    const product = await productReplicasRepository.findbyId(productId);

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    if (!product.isActive) {
      throw new BadRequestError("Product is no longer available");
    }

    if (quantity > product.stockQuantity) {
      throw new BadRequestError(
        `Cannot update to ${quantity}. Only ${product.stockQuantity} items left in stockQuantity.`,
      );
    }

    await cartRepository.updateQuantity(userId, productId, quantity);
  }
  async validateCart(
    userId: string,
  ): Promise<{ valid: boolean; errors: string[] }> {
    const cart = await this.getCart(userId);
    const errors: string[] = [];

    if (cart.items.length === 0) {
      return { valid: false, errors: ["Cart is empty"] };
    }

    for (const item of cart.items) {
      if (item.product.stockQuantity === 0) {
        errors.push(`"${item.product.name}" is out of stockQuantity.`);
      } else if (item.quantity > item.product.stockQuantity) {
        errors.push(
          `"${item.product.name}" only has ${item.product.stockQuantity} items left in stockQuantity.`,
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async removeFromCard(userId: string, productId: string) {
    await cartRepository.removeItem(userId, productId);
  }

  async clearCart(userId: string) {
    await cartRepository.clearCart(userId);
  }

  async getCartItemCount(userId: string) {
    return await cartRepository.getItemCount(userId);
  }
}

export default new CartService();
