"use server";

import api from "@/lib/api";

export async function removeFromCart(productId: string) {
  try {
    await api.delete(`/cart/${productId}`);
  } catch (error) {
    console.error("Error removing item from cart:", error);
  }
}

export async function addToCart(productId: string, quantity: number) {
  try {
    await api.post("/cart", { productId, quantity });
  } catch (error) {
    console.error("Error removing item from cart:", error);
  }
}

export async function updateCartItem(productId: string, quantity: number) {
  try {
    await api.patch(`/cart/${productId}`, { quantity });
  } catch (error) {
    console.error("Error updating item in cart:", error);
  }
}

export async function clearCart() {
  try {
    await api.delete("/cart");
  } catch (error) {
    console.error("Error updating item in cart:", error);
  }
}
