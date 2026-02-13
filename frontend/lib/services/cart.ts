import { Cart } from "@/types";
import { cache } from "react";
import { api } from "@/lib/clients/server";

export async function getCart(): Promise<Cart> {
  const res = await api("/cart");

  if (!res.ok) {
    const err = await res.json();
    throw err;
  }

  const json = await res.json();
  return json.data;
}

export const getCartCount = cache(async () => {
  const res = await api("/cart/count");

  console.log({ res });

  if (!res.ok) {
    const err = await res.json();
    console.log({ err });
    throw err;
  }

  return await res.json();
});

export async function validateCart() {
  const res = await api("/cart/validate");

  if (!res.ok) {
    const err = await res.json();
    throw err;
  }

  return await res.json();
}
