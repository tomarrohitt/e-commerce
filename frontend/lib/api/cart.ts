import { Cart } from "@/types";
import { cache } from "react";
import { api } from "./server";
import { getUserFromSession } from "../user-auth";

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
  const res = await api("/cart/count", {
    cache: "force-cache",
    next: { tags: [`cart-count-${(await getUserFromSession())!.id}`] },
  });

  if (!res.ok) {
    const err = await res.json();
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
