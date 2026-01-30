"use client";

import { MapPin, Check, Phone, User } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Address } from "@/types";
import { useCheckout } from "@/contexts/checkout-context";
import { AddressDialog } from "@/components/address-modal";
import { entranceAnim } from "@/lib/constants/enter-animation";

interface ShippingSectionProps {
  addresses: Address[];
}

export function ShippingSection({ addresses }: ShippingSectionProps) {
  const { selectedAddressId, setSelectedAddressId } = useCheckout();

  const handleSelect = (id: string) => {
    setSelectedAddressId(id);
  };

  if (addresses.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div
            className={`w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 ${entranceAnim} delay-200`}
          >
            <MapPin className="w-8 h-8 text-muted-foreground" />
          </div>
          <p
            className={`text-muted-foreground mb-6 text-center ${entranceAnim} delay-300`}
          >
            You don&apos;t have any saved addresses yet
          </p>

          <AddressDialog />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      <CardHeader
        className={`border-b bg-muted/30 py-5 ${entranceAnim} delay-300`}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              1
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Shipping Address
            </h2>
          </div>
          <AddressDialog />
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-3">
          {addresses.map((address, index) => (
            <AddressCard
              key={address.id}
              address={address}
              handleSelect={handleSelect}
              isSelected={address.id === selectedAddressId}
              index={index}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AddressCard({
  address,
  handleSelect,
  isSelected,
  index,
}: {
  address: Address;
  handleSelect: (addressId: string) => void;
  isSelected: boolean;
  index: number;
}) {
  return (
    <div
      onClick={() => handleSelect(address.id)}
      className={`relative p-5 rounded-xl cursor-pointer transition-all duration-200 ${
        isSelected
          ? "bg-primary/5 ring-2 ring-primary shadow-sm"
          : "bg-muted/30 hover:bg-muted/50 ring-1 ring-transparent"
      } ${entranceAnim}`}
      style={{ animationDelay: `${300 + index * 100}ms` }}
    >
      <div className="flex items-start gap-4">
        <div
          className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            isSelected
              ? "border-primary bg-primary"
              : "border-muted-foreground/30"
          }`}
        >
          {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">
              {address.name}
            </span>
            {address.isDefault && (
              <Badge variant="secondary" className="text-xs ml-auto">
                Default
              </Badge>
            )}
          </div>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                {address.street}, {address.city}, {address.state}{" "}
                {address.zipCode}, {address.country}
              </span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 shrink-0" />
              <span>{address.phoneNumber}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
