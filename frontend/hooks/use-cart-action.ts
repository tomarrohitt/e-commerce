import { useState } from "react";
import { cartService } from "@/lib/api";
import { useCart } from "@/contexts/cart-context";
import toast from "react-hot-toast";
import { handleApiError } from "@/lib/error-handler";

export function useCartActions() {
  const { refreshCart } = useCart();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const addToUpdating = (productId: string) => {
    setUpdatingItems((prev) => new Set(prev).add(productId));
  };

  const removeFromUpdating = (productId: string) => {
    setUpdatingItems((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      addToUpdating(productId);
      await cartService.updateCartItem(productId, newQuantity);
      await refreshCart();
    } catch (error) {
      handleApiError(error, "Failed to update cart");
    } finally {
      removeFromUpdating(productId);
    }
  };

  const removeItem = async (productId: string) => {
    try {
      addToUpdating(productId);
      await cartService.removeFromCart(productId);
      await refreshCart();
      toast.success("Item removed from cart");
    } catch (error) {
      handleApiError(error, "Failed to remove item");
    } finally {
      removeFromUpdating(productId);
    }
  };

  const clearCart = async () => {
    if (!confirm("Are you sure you want to clear your cart?")) return;

    try {
      await cartService.clearCart();
      await refreshCart();
      toast.success("Cart cleared");
    } catch (error) {
      handleApiError(error, "Failed to clear cart");
    }
  };

  return {
    updateQuantity,
    removeItem,
    clearCart,
    isUpdating: (productId: string) => updatingItems.has(productId),
  };
}
