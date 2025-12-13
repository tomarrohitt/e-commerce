import { useState } from "react";
import { useRouter } from "next/navigation";
import { cartService } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import toast from "react-hot-toast";
import type { Product } from "@/types";

export function useProductDetail(product: Product) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { refreshCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  const isOutOfStock = product.stockQuantity === 0;
  const maxQuantity = Math.min(product.stockQuantity, 10);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to cart");
      router.push(`/sign-in?redirect=/products/${product.id}`);
      return;
    }

    try {
      setAddingToCart(true);
      await cartService.addToCart(product.id, quantity);
      await refreshCart();
      toast.success("Added to cart!");
      setQuantity(1);
    } catch (error: any) {
      toast.error(error.error || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to purchase");
      router.push(`/sign-in?redirect=/products/${product.id}`);
      return;
    }

    try {
      setAddingToCart(true);
      await cartService.addToCart(product.id, quantity);
      await refreshCart();
      toast.success("Added to cart!");
      router.push("/checkout");
    } catch (error: any) {
      toast.error(error.error || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const incrementQuantity = () => {
    setQuantity((prev) => Math.min(maxQuantity, prev + 1));
  };

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  return {
    quantity,
    setQuantity,
    selectedImage,
    setSelectedImage,
    addingToCart,
    isOutOfStock,
    maxQuantity,
    handleAddToCart,
    handleBuyNow,
    incrementQuantity,
    decrementQuantity,
  };
}
