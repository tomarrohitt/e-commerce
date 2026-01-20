"use server";

import api from "@/lib/api";
import { revalidatePath } from "next/cache";
import { refresh } from "next/cache";

export async function removeFromCart(productId: string) {
  try {
    await api.delete(`/cart/${productId}`);
    revalidatePath("/cart");
  } catch (error) {
    console.error("Error removing item from cart:", error);
  }
  refresh();
}

export async function addToCart(productId: string, quantity: number) {
  try {
    await api.post("/cart", { productId, quantity });
    revalidatePath("/cart");
  } catch (error) {
    console.error("Error adding item from cart:", error);
  }
  refresh();
}

export async function updateCartItem(productId: string, quantity: number) {
  try {
    await api.patch(`/cart/${productId}`, { quantity });
    revalidatePath("/cart");
  } catch (error) {
    console.error("Error updating item in cart:", error);
  }
  refresh();
}

export async function clearCart() {
  try {
    await api.delete("/cart");
    revalidatePath("/cart");
  } catch (error) {
    console.error("Error clearing the cart:", error);
  }
  refresh();
}
