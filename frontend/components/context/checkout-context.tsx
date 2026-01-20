"use client";

import { createContext, useState, useContext, type ReactNode } from "react";

interface CheckoutContextType {
  selectedAddressId: string | null;
  setSelectedAddressId: (id: string | null) => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(
  undefined,
);

export function CheckoutProvider({
  children,
  defaultAddressId = null,
}: {
  children: ReactNode;
  defaultAddressId?: string | null;
}) {
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    defaultAddressId,
  );

  return (
    <CheckoutContext.Provider
      value={{
        selectedAddressId,
        setSelectedAddressId,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
}
