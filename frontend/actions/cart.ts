"use server";

import { api } from "@/lib/clients/server";

export async function removeFromCart(productId: string) {
  try {
    const res = await api(`/cart/${productId}`, { method: "DELETE" });

    if (!res.ok) {
      const err = await res.json();
      throw err;
    }
  } catch (error) {
    console.error("Error removing item from cart:", error);
  }
}

export async function addToCart(productId: string, quantity: number) {
  try {
    const res = await api("/cart", {
      method: "POST",
      body: { productId, quantity },
    });

    if (!res.ok) {
      const err = await res.json();
      throw err;
    }
  } catch (error) {
    console.error("Error adding item to cart:", error);
  }
}

export async function updateCartItem(productId: string, newQuantity: number) {
  try {
    const res = await api(`/cart/${productId}`, {
      method: "PATCH",
      body: { quantity: newQuantity },
    });

    if (!res.ok) {
      const err = await res.json();
      throw err;
    }
    const data = await res.json();

    return {
      success: true,
      quantity: newQuantity,
      data,
    };
  } catch (error) {
    console.error("Error updating item in cart:", error);
    return { success: false };
  }
}

export async function clearCart() {
  try {
    const res = await api("/cart", { method: "DELETE" });

    if (!res.ok) {
      const err = await res.json();
      throw err;
    }
  } catch (error) {
    console.error("Error clearing the cart:", error);
  }
}
