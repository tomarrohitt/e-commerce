import { api } from "./client";

export const cartService = {
  async addToCart(productId: string, quantity: number) {
    const response = await api.post("/cart", { productId, quantity });
    return response.data;
  },

  async getCart() {
    const response = await api.get("/cart");
    return response.data.data;
  },

  async updateCartItem(productId: string, quantity: number) {
    const response = await api.patch(`/cart/${productId}`, { quantity });
    return response.data;
  },

  async removeFromCart(productId: string) {
    const response = await api.delete(`/cart/${productId}`);
    return response.data;
  },

  async clearCart() {
    const response = await api.delete("/cart");
    return response.data;
  },

  async getCartCount() {
    const response = await api.get("/cart/count");
    return response.data;
  },

  async validateCart() {
    const response = await api.get("/cart/validate");
    return response.data;
  },
};
