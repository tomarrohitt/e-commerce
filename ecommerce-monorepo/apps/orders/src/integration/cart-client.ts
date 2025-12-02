import { HttpClient, DatabaseOpError } from "@ecommerce/common";

interface CartValidationResponse {
  valid: boolean;
  errors: string[];
  cart: {
    items: {
      productId: string;
      quantity: number;
      price: number;
      name: string;
      image: string | null;
      sku: string;
    }[];
    totalPrice: number;
  };
}

const cartClient = new HttpClient(
  process.env.CART_SERVICE_URL || "http://localhost:4003",
  "CartService",
);

export async function validateAndFetchCart(userId: string) {
  try {
    const response = await cartClient.get<any>(`/api/cart/validate`, {
      headers: { "x-user-id": userId },
    });

    if (!response.success || !response.data.valid) {
      throw new Error(response.data?.errors?.join(", ") || "Invalid Cart");
    }

    return response.data.cart;
  } catch (error: any) {
    throw new DatabaseOpError("Cart service unavailable: " + error.message);
  }
}

export async function clearRemoteCart(userId: string) {
  cartClient
    .delete("/api/cart", { headers: { "x-user-id": userId } })
    .catch((err) => console.error("Failed to clear cart", err));
}
