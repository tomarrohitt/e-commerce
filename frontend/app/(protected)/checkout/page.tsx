"use client";

import { useCheckout } from "@/hooks/use-checkout";
import { useAddressModal } from "@/hooks/use-address-modal";
import { ShippingSection } from "@/components/checkout/shipping-section";
import { PaymentSection } from "@/components/checkout/payment-section";
import { OrderSummary } from "@/components/checkout/order-summary";
import AddAddressModal from "@/components/address-modal";
import { Skeleton } from "@/components/ui/skeleton";

export default function CheckoutPage() {
  const {
    cart,
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    paymentMethod,
    setPaymentMethod,
    handlePlaceOrder,
    isSubmitting,
    isLoading,
  } = useCheckout();

  const { isModalOpen, openAddModal, closeModal, editingAddress } =
    useAddressModal();

  if (isLoading) {
    return <CheckoutSkeleton />;
  }

  if (!cart) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <ShippingSection
            addresses={addresses}
            selectedAddressId={selectedAddressId}
            onSelectAddress={setSelectedAddressId}
            onAddNewAddress={openAddModal}
          />
          <PaymentSection
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
          />
        </div>

        <div className="lg:col-span-1">
          <OrderSummary
            cart={cart}
            onCheckout={handlePlaceOrder}
            isSubmitting={isSubmitting}
            canCheckout={!!selectedAddressId}
          />
        </div>
      </div>

      <AddAddressModal
        isOpen={isModalOpen}
        onClose={closeModal}
        addressToEdit={editingAddress}
      />
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Skeleton className="h-8 w-1/4 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}
