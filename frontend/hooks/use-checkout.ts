import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { addressService, orderService } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import toast from "react-hot-toast";
import type { Address } from "@/types";

export function useCheckout() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { cart, loading: cartLoading } = useCart();

  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "cod">(
    "stripe",
  );
  const [isLocked, setIsLocked] = useState(false);

  // Fetch addresses
  const { data: addressData, isLoading: addressesLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: addressService.getAddresses,
    enabled: isAuthenticated,
  });

  const addresses: Address[] = addressData || [];

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find((a) => a.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    }
  }, [addresses, selectedAddressId]);
  useEffect(() => {
    if (!cartLoading && (!cart || cart.items.length === 0)) {
      router.push("/cart");
    }
  }, [cart, cartLoading, router]);

  // Place order mutation
  const { mutate: placeOrder, isPending: isSubmitting } = useMutation({
    mutationFn: (orderData: any) => orderService.createOrder(orderData),
    onSuccess: (response) => {
      toast.success(`${response.message}!` || "Order created successfully!");
      router.push(`/orders/${response.data.orderId}`);
    },
    onError: (error: any) => {
      toast.error(error.error || "Failed to place order");
      setIsLocked(false);
    },
  });

  const handlePlaceOrder = async () => {
    if (isLocked) return;
    setIsLocked(true);

    if (!selectedAddressId) {
      toast.error("Please select a shipping address");
      setIsLocked(false);
      return;
    }

    if (!cart) return;

    const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
    if (!selectedAddress) {
      toast.error("Selected address not found");
      setIsLocked(false);
      return;
    }

    const orderItems = cart.items.map((item) => ({
      productId: item.productId,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      sku: item.product.sku,
    }));

    const payload = {
      shippingAddress: {
        street: selectedAddress.street,
        city: selectedAddress.city,
        state: selectedAddress.state,
        zipCode: selectedAddress.zipCode,
        country: selectedAddress.country,
        phoneNumber: selectedAddress.phoneNumber || "",
      },
      paymentMethod,
      totalAmount: cart?.totalAmount,
      items: orderItems,
    };

    placeOrder(payload);
  };

  const isLoading = isAuthLoading || addressesLoading || cartLoading;

  return {
    cart,
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    paymentMethod,
    setPaymentMethod,
    handlePlaceOrder,
    isSubmitting,
    isLoading,
  };
}
