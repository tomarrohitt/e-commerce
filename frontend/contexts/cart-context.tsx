"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { cartService } from "@/lib/api";
import { useAuth } from "./auth-context";

interface CartItem {
  productId: string;
  quantity: number;
  addedAt: string;
  product: {
    id: string;
    name: string;
    price: number;
    stockQuantity: number;
    images: string[];
  };
}

interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  refreshCart: () => Promise<void>;
  cartCount: number;
}

const CartContext = createContext<CartContextType>({
  cart: null,
  loading: true,
  refreshCart: async () => {},
  cartCount: 0,
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      setCart(null);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const refreshCart = async () => {
    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCart(data);
    } catch (error) {
      console.error("Failed to load cart:", error);
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        refreshCart,
        cartCount: cart?.totalItems || 0,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
