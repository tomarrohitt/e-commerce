import { CartItem, RedisService } from "@ecommerce/common";
import { env } from "../config/env";
import { redis } from "../config/redis";

class CartRepository {
  private getCartKey(userId: string): string {
    return `cart:${userId}`;
  }

  private get client() {
    return redis.getClient();
  }

  async addItem(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<void> {
    const key = this.getCartKey(userId);

    const item: CartItem = {
      productId,
      quantity,
      addedAt: new Date(),
    };

    await this.client.hset(key, productId, JSON.stringify(item));

    await this.client.expire(key, 60 * 60 * 24 * 7);
  }

  async getItem(userId: string, productId: string): Promise<CartItem | null> {
    const key = this.getCartKey(userId);
    const itemJson = await this.client.hget(key, productId);

    if (!itemJson) return null;

    return JSON.parse(itemJson);
  }

  async getAllItems(userId: string): Promise<CartItem[]> {
    const key = this.getCartKey(userId);
    const itemsMap = await this.client.hgetall(key);

    const items: CartItem[] = Object.values(itemsMap).map((jsonString) => {
      const item = JSON.parse(jsonString);

      return item;
    });

    return items;
  }

  async updateQuantity(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<void> {
    const key = this.getCartKey(userId);

    const exists = await this.client.hexists(key, productId);
    if (!exists) {
      throw new Error("Item not in cart");
    }

    const itemJson = await this.client.hget(key, productId);
    const item: CartItem = JSON.parse(itemJson!);

    item.quantity = quantity;

    await this.client.hset(key, productId, JSON.stringify(item));
    await this.client.expire(key, 60 * 60 * 24 * 7);
  }

  async removeItem(userId: string, productId: string): Promise<void> {
    const key = this.getCartKey(userId);
    await this.client.hdel(key, productId);
  }

  async clearCart(userId: string): Promise<void> {
    const key = this.getCartKey(userId);
    await this.client.del(key);
  }

  async getItemCount(userId: string): Promise<number> {
    const key = this.getCartKey(userId);
    return await this.client.hlen(key);
  }
}

export default new CartRepository();
