import redis from "../config/redis";
import { CartItem } from "../types";

class CartRepository {
  private getCartKey(userId: string): string {
    return `cart:${userId}`;
  }

  async addItem(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<void> {
    const key = this.getCartKey(userId);

    const item: CartItem = {
      productId,
      quantity,
      addedAt: new Date(),
    };
    await redis.hset(key, `product:${productId}`, JSON.stringify(item));

    await redis.expire(key, 60 * 60 * 24);
  }

  async getItem(userId: string, productId: string): Promise<CartItem | null> {
    const key = this.getCartKey(userId);
    const item = await redis.hget(key, `product:${productId}`);

    if (!item) return null;

    return JSON.parse(item);
  }

  async getAllItems(userId: string): Promise<Map<string, CartItem>> {
    const key = this.getCartKey(userId);
    const items = await redis.hgetall(key);

    const cartItems = new Map<string, CartItem>();
    for (const [field, value] of Object.entries(items)) {
      const productId = field.split(":")[1];
      cartItems.set(productId, JSON.parse(value));
    }

    return cartItems;
  }

  async updateQuantity(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<void> {
    const key = this.getCartKey(userId);

    const item = await this.getItem(userId, productId);

    if (!item) {
      throw new Error("Item not in cart");
    }

    item.quantity = quantity;

    await redis.hset(key, `product:${productId}`, JSON.stringify(item));

    await redis.expire(key, 60 * 60 * 24);
  }

  async removeItem(userId: string, productId: string): Promise<void> {
    const key = this.getCartKey(userId);

    await redis.hdel(key, `product:${productId}`);
  }

  async clearCart(userId: string): Promise<void> {
    const key = this.getCartKey(userId);

    await redis.del(key);
  }

  async getItemCount(userId: string): Promise<number> {
    const key = this.getCartKey(userId);
    return await redis.hlen(key);
  }
}

export default new CartRepository();
