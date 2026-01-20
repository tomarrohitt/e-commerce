"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Address, Cart } from "@/types";
import { useCheckout } from "../context/checkout-context";
import { useTransition } from "react";
import { createOrder } from "@/actions/order";

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

  const items = cart.items.map((item) => ({
    productId: item.productId,
    thumbnail: item.product.thumbnail,
    name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
  }));

  const shippingAddress = {
    name: address!.name,
    street: address!.street,
    city: address!.city,
    state: address!.state,
    zipCode: address!.zipCode,
    country: address!.country,
    phoneNumber: address!.phoneNumber,
  };

  const order = {
    items,
    shippingAddress,
    totalAmount: cart.totalAmount,
  };

  const handleCheckout = () => {
    startTransition(async () => {
      await createOrder(order);
    });
  };

  return (
    <Button
      className="w-full h-12 text-base font-semibold gap-2 group"
      size="lg"
      onClick={handleCheckout}
      disabled={pending || !address}
    >
      Place Order
      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
    </Button>
  );
};
