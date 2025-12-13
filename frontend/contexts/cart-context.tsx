"use client";

import { createContext, useContext, ReactNode, useCallback } from "react";
import { cartService } from "@/lib/api";
import { useAuth } from "./auth-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Cart } from "../../backend/src/types/index";

// ... (Your CartItem and Cart interfaces are perfect) ...

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
  // 1. Get BOTH values from useAuth, and rename isLoading
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  // 2. Rename the isLoading from useQuery
  const { data: cart, isLoading: isCartLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: () => cartService.getCart(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });
  const refreshCart = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["cart"] });
  }, [queryClient]);

  const loading = isAuthLoading || isCartLoading;
  return (
    <CartContext.Provider
      value={{
        cart: cart || null,
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
