"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Address, Cart } from "@/types";
import { useCheckout } from "@/contexts/checkout-context";
import { useTransition } from "react";
import { createOrder } from "@/actions/order";
import { toast } from "sonner";
import { clearCart } from "@/actions/cart";

export const PlaceOrderButton = ({
  cart,
  addresses,
}: {
  cart: Cart;
  addresses: Address[];
}) => {
  const { selectedAddressId } = useCheckout();
  const [pending, startTransition] = useTransition();

  const address = selectedAddressId
    ? addresses.find((a) => a.id === selectedAddressId)
    : null;

  const handleCheckout = () => {
    if (!address) {
      toast.error("Please select a shipping address");
      return;
    }

    startTransition(async () => {
      const items = cart.items.map((item) => ({
        productId: item.productId,
        thumbnail: item.product.thumbnail,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      }));

      const shippingAddress = {
        name: address.name,
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        phoneNumber: address.phoneNumber,
      };

      const orderData = {
        items,
        shippingAddress,
        totalAmount: cart.totalAmount,
      };

      await clearCart();
      await createOrder(orderData);
    });
  };

  return (
    <Button
      className="w-full h-12 text-base font-semibold gap-2 group"
      size="lg"
      onClick={handleCheckout}
      disabled={pending || !address}
    >
      {pending ? "Processing..." : "Place Order"}
      {!pending && (
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      )}
    </Button>
  );
};
