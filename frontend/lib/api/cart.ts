import { Cart } from "@/types";
import api from "./server";

export async function getCart(): Promise<Cart> {
  const response = await api.get("/cart");
  return response.data.data;
}

export async function getCartCount() {
  const response = await api.get("/cart/count");
  return response.data;
}

export async function validateCart() {
  const response = await api.get("/cart/validate");
  return response.data;
}
