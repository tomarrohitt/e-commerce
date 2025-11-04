import cartRepository from "../repository/cart-repository";
import productRepository from "../repository/product-repository";
import { CartItemWithProduct } from "../types/index";

class CartService {
  async addItem(userId: string, productId: string, quantity: number) {
    const product = await productRepository.findbyId(productId);

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.stockQuantity < quantity) {
      throw new Error("Only " + product.stockQuantity + " ites in stock");
    }

    const existingItem = await cartRepository.getItem(userId, productId);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > product.stockQuantity) {
        throw new Error(
          `Cannot add ${quantity} items. Only ${product.stockQuantity} items in stock`
        );
      }

      await cartRepository.updateQuantity(userId, productId, newQuantity);
    } else {
      await cartRepository.addItem(userId, productId, quantity);
    }
  }

  async getCart(userId: string) {
    const cartItems = await cartRepository.getAllItems(userId);
    if (cartItems.size === 0) {
      return {
        items: [],
        totalItems: 0,
        totalPrice: 0,
      };
    }
    const productIds = Array.from(cartItems.keys());
    const products = await productRepository.findByIds(productIds);

    const items: CartItemWithProduct[] = [];

    let totalItems = 0;
    let totalPrice = 0;

    for (const [productId, cartItem] of cartItems) {
      const product = products.find((p) => p.id === productId);

      if (!product) {
        await cartRepository.removeItem(userId, productId);
        continue;
      }

      if (product.stockQuantity === 0) {
        items.push({
          ...cartItem,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            images: product.images,
            stockQuantity: product.stockQuantity,
          },
        });
        continue;
      }

      let quantity = cartItem.quantity;
      if (product.stockQuantity < quantity) {
        quantity = product.stockQuantity;

        await cartRepository.updateQuantity(userId, productId, quantity);
      }

      const itemTotal = product.price * quantity;

      items.push({
        productId: cartItem.productId,
        quantity,
        addedAt: cartItem.addedAt,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          stockQuantity: product.stockQuantity,
          images: product.images,
        },
      });

      totalItems += quantity;
      totalPrice += itemTotal;
    }

    return {
      items,
      totalItems,
      totalPrice,
    };
  }

  async updateCartItem(userId: string, productId: string, quantity: number) {
    const existingItem = await cartRepository.getItem(userId, productId);

    if (!existingItem) {
      throw new Error("Item not in cart");
    }

    const product = await productRepository.findbyId(productId);

    if (!product) {
      throw new Error("Product not found");
    }

    if (quantity > product.stockQuantity) {
      throw new Error(`Only ${product.stockQuantity} items in stock`);
    }

    await cartRepository.updateQuantity(userId, productId, quantity);
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

  async validateCart(
    userId: string
  ): Promise<{ valid: boolean; errors: string[] }> {
    const cart = await this.getCart(userId);
    const errors: string[] = [];

    if (cart.items.length === 0) {
      errors.push("Cart is empty");
    }

    for (const item of cart.items) {
      if (item.product.stockQuantity === 0) {
        errors.push(`${item.product.name} is out of stock`);
      } else if (item.quantity > item.product.stockQuantity) {
        errors.push(
          `${item.product.name} only has ${item.product.stockQuantity} items in stock`
        );
      }
    }
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export default new CartService();
