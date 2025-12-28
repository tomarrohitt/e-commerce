import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Address } from "@/types";

interface ShippingSectionProps {
  addresses: Address[];
  selectedAddressId: string;
  onSelectAddress: (id: string) => void;
  onAddNewAddress: () => void;
}

export function ShippingSection({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddNewAddress,
}: ShippingSectionProps) {
  if (addresses.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-600 mb-4">
            You don't have any saved addresses
          </p>
          <Button onClick={onAddNewAddress}>Add Address</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
          <Button variant="ghost" size="sm" onClick={onAddNewAddress}>
            + Add New
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              isSelected={selectedAddressId === address.id}
              onSelect={() => onSelectAddress(address.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AddressCard({
  address,
  isSelected,
  onSelect,
}: {
  address: Address;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
        isSelected
          ? "border-purple-600 bg-purple-50"
          : "border-gray-200 hover:border-purple-300"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <input
            type="radio"
            checked={isSelected}
            onChange={onSelect}
            className="mt-1"
          />
          <div>
            <p className="font-semibold text-gray-900">
              {address.type === "shipping" ? "📦" : "💳"} {address.street}
            </p>
            <p className="text-gray-600 text-sm">
              {address.city}, {address.state} {address.zipCode}
            </p>
            <p className="text-gray-600 text-sm">{address.country}</p>
          </div>
        </div>
        {address.isDefault && (
          <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
            Default
          </span>
        )}
      </div>
    </div>
  );
}
