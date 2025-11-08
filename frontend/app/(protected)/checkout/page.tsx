// src/app/(protected)/checkout/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/cart-context";
import { addressService, orderService } from "@/lib/api";
import toast from "react-hot-toast";

interface Address {
  id: string;
  type: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, loading: cartLoading } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "cod">(
    "stripe"
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const response = await addressService.getAddresses();
      setAddresses(response.addresses);

      // Auto-select default address
      const defaultAddress = response.addresses.find(
        (a: Address) => a.isDefault
      );
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    } catch (error: any) {
      toast.error(error.error || "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a shipping address");
      return;
    }

    try {
      setSubmitting(true);

      const response = await orderService.createOrder({
        shippingAddressId: selectedAddressId,
        paymentMethod,
      });

      toast.success("Order placed successfully!");

      // If payment method is Stripe, redirect to payment page
      if (paymentMethod === "stripe" && response.order.clientSecret) {
        router.push(
          `/checkout/payment?orderId=${response.order.id}&clientSecret=${response.order.clientSecret}`
        );
      } else {
        // For COD, redirect to order confirmation
        router.push(`/orders/${response.order.id}`);
      }
    } catch (error: any) {
      toast.error(error.error || "Failed to place order");
      setSubmitting(false);
    }
  };

  if (loading || cartLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded-xl"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-300 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    router.push("/cart");
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Shipping Address
              </h2>
              <button
                onClick={() => router.push("/addresses/new?returnTo=/checkout")}
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                + Add New
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  You don't have any saved addresses
                </p>
                <button
                  onClick={() =>
                    router.push("/addresses/new?returnTo=/checkout")
                  }
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Add Address
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    onClick={() => setSelectedAddressId(address.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedAddressId === address.id
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          checked={selectedAddressId === address.id}
                          onChange={() => setSelectedAddressId(address.id)}
                          className="mt-1"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {address.type === "shipping" ? "📦" : "💳"}{" "}
                            {address.street}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {address.city}, {address.state} {address.zipCode}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {address.country}
                          </p>
                          {address.isDefault && (
                            <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Payment Method
            </h2>

            <div className="space-y-3">
              <div
                onClick={() => setPaymentMethod("stripe")}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === "stripe"
                    ? "border-purple-600 bg-purple-50"
                    : "border-gray-200 hover:border-purple-300"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    checked={paymentMethod === "stripe"}
                    onChange={() => setPaymentMethod("stripe")}
                  />
                  <div>
                    <p className="font-semibold text-gray-900">
                      💳 Credit/Debit Card
                    </p>
                    <p className="text-sm text-gray-600">
                      Pay securely with Stripe
                    </p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setPaymentMethod("cod")}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === "cod"
                    ? "border-purple-600 bg-purple-50"
                    : "border-gray-200 hover:border-purple-300"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                  />
                  <div>
                    <p className="font-semibold text-gray-900">
                      💵 Cash on Delivery
                    </p>
                    <p className="text-sm text-gray-600">
                      Pay when you receive your order
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Order Summary
            </h2>

            {/* Order Items */}
            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {cart.items.map((item) => (
                <div key={item.productId} className="flex space-x-3">
                  <div className="w-16 h-16 bg-linear-to-br from-purple-400 to-indigo-600 rounded-lg overflow-hidden shrink-0">
                    {item.product.images[0] ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-xl">
                        📦
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity}
                    </p>
                    <p className="text-sm font-semibold text-purple-600">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${cart.totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600">FREE</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (10%)</span>
                <span>${(cart.totalPrice * 0.1).toFixed(2)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-purple-600">
                    ${(cart.totalPrice * 1.1).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={!selectedAddressId || submitting}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mb-3"
            >
              {submitting ? "Processing..." : "Place Order"}
            </button>

            <p className="text-xs text-gray-500 text-center">
              By placing your order, you agree to our Terms of Service and
              Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
