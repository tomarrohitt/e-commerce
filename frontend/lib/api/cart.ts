import { Cart } from "@/types";
import api from "./server";

export async function getCart(): Promise<Cart> {
  const response = await api.get("/cart");
  return response.data.data;
}

export const getCartCount = async () => {
  const response = await api.get("/cart/count");
  return response.data;
};

export async function validateCart() {
  const response = await api.get("/cart/validate");
  return response.data;
}
