"use client";

import { createContext, useContext, useMemo, useCallback, memo } from "react";
import { cartService } from "@/lib/api";
import { useAuth } from "./auth-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Cart } from "@/types";

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

// ✅ Memoize provider to prevent re-renders when auth changes but cart doesn't
export const CartProvider = memo(function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: cart, isLoading: isCartLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: () => cartService.getCart(),
    enabled: isAuthenticated,
    // ✅ CRITICAL FIX: Don't refetch on every mount
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // ✅ Memoize callback
  const refreshCart = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["cart"] });
  }, [queryClient]);

  // ✅ Memoize context value
  const value = useMemo(
    () => ({
      cart: cart || null,
      loading: isAuthLoading || isCartLoading,
      refreshCart,
      cartCount: cart?.totalItems || 0,
    }),
    [cart, isAuthLoading, isCartLoading, refreshCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
});

export const useCart = () => useContext(CartContext);
