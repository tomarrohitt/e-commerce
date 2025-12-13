"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/cart-context";
import { addressService, orderService } from "@/lib/api";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/auth-context";
import { useMutation, useQuery } from "@tanstack/react-query";
import AddAddressModal from "@/components/address-modal";
import { useAddressModal } from "@/hooks/use-address-modal";

interface Address {
  id: string;
  type: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  phoneNumber?: string;
}

export default function CheckoutPage() {
  const router = useRouter();

  const {
    isModalOpen,
    openAddModal,
    closeModal,
    editingAddress,
    openEditModal,
  } = useAddressModal();

  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { cart, loading: cartLoading } = useCart();
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "cod">(
    "stripe",
  );

  const [isLocked, setIsLocked] = useState(false);

  const { data: addressData, isLoading: addressesLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: addressService.getAddresses,
    enabled: isAuthenticated,
  });

  const addresses: Address[] = addressData || [];

  const { mutate: placeOrder, isPending: isSubmitting } = useMutation({
    mutationFn: (orderData: any) => orderService.createOrder(orderData),
    onSuccess: (response) => {
      toast.success("Order placed successfully!");
      console.log({ response });
      router.push(`/orders/${response.data.orderId}`);
    },
    onError: (error: any) => {
      toast.error(error.error || "Failed to place order");
    },
  });

  useEffect(() => {
    if (!cartLoading && (!cart || cart.items.length === 0)) {
      router.push("/cart");
    }
  }, [cart, cartLoading, router]);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find((a) => a.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    }
  }, [addresses, selectedAddressId]);

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

    placeOrder(payload, {
      onError: () => setIsLocked(false),
    });
  };

  const isLoading = isAuthLoading || addressesLoading || cartLoading;

  if (isLoading) {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Shipping Address
              </h2>
              {addressData.length !== 0 && (
                <button
                  onClick={openAddModal}
                  className="text-purple-600 hover:text-purple-700 font-semibold"
                >
                  + Add New
                </button>
              )}
            </div>

            {addresses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  You don't have any saved addresses
                </p>
                <button
                  onClick={openAddModal}
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
                        </div>
                      </div>
                      {address.isDefault && (
                        <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                          Default
                        </span>
                      )}
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
              {cart?.items.map((item) => (
                <div key={item.productId} className="flex space-x-3">
                  <div className="w-16 h-16 bg-linear-to-br from-purple-400 to-indigo-600 rounded-lg overflow-hidden shrink-0">
                    {item.product.thumbnail ? (
                      <img
                        src={item.product.thumbnail}
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
                <span>${cart?.subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600">FREE</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (18%)</span>
                <span>${cart?.tax}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-purple-600">
                    ${cart?.totalAmount}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={!selectedAddressId || isSubmitting}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mb-3"
            >
              {isSubmitting ? "Processing..." : "Place Order"}
            </button>

            <p className="text-xs text-gray-500 text-center">
              By placing your order, you agree to our Terms of Service and
              Privacy Policy
            </p>
          </div>
        </div>
      </div>
      <AddAddressModal
        isOpen={isModalOpen}
        onClose={() => {
          closeModal();
        }}
        addressToEdit={editingAddress}
      />
    </div>
  );
}
