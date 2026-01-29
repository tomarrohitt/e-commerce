import { getAddresses } from "@/lib/api/addresses-cached";
import { CheckCircle, Home, MapPin, Phone } from "lucide-react";

import { AddressDialog } from "@/components/address-modal";
import { SetToDefaultButton } from "./set-to-default-button";
import { DeleteAddressButton } from "./delete-address-button";
import { cn } from "@/lib/utils";
import { entranceAnim } from "@/lib/enter-animation";

export default async function AddressesPage() {
  const { data: addresses } = await getAddresses();

  if (addresses.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <div
          className={`w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 ${entranceAnim}`}
        >
          <MapPin className="w-8 h-8 text-slate-400" />
        </div>

        <h2
          className={`text-xl font-semibold text-slate-900 mb-2 ${entranceAnim}`}
        >
          No addresses found
        </h2>

        <p
          className={`text-slate-500 mb-6 max-w-md mx-auto ${entranceAnim} delay-75`}
        >
          Add a shipping address to continue with checkout.
        </p>

        <AddressDialog />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className={`text-3xl font-bold text-slate-900 flex items-center gap-3 ${entranceAnim}`}
              >
                <Home className="w-8 h-8 text-blue-500" />
                My Addresses
              </h1>
              <p className={`mt-2 text-slate-500 ${entranceAnim} delay-75`}>
                Manage your shipping and billing addresses
              </p>
            </div>

            {addresses.length > 0 && <AddressDialog />}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address, i) => (
            <div
              key={address.id}
              className={cn(
                `relative bg-white rounded-xl border flex flex-col transition-shadow ${entranceAnim} delay-${100 + i * 100}`,
                address.isDefault
                  ? "border-blue-500 shadow-sm"
                  : "border-slate-200 hover:shadow-md",
              )}
            >
              {address.isDefault && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              )}

              <div className="p-6 flex flex-col flex-1">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "p-2 rounded-lg shrink-0",
                        address.isDefault ? "bg-blue-100" : "bg-slate-100",
                      )}
                    >
                      <Home
                        className={cn(
                          "w-5 h-5",
                          address.isDefault
                            ? "text-blue-600"
                            : "text-slate-500",
                        )}
                      />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-slate-900 truncate">
                        {address.name}
                      </h3>

                      {address.isDefault && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full mt-1">
                          <CheckCircle className="w-3 h-3" />
                          Default
                        </span>
                      )}
                    </div>
                  </div>

                  <AddressDialog address={address} />
                </div>

                {/* Address */}
                <div className="space-y-3 text-sm text-slate-700 flex-1">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                    <div className="leading-relaxed">
                      <div>{address.street}</div>
                      <div>
                        {address.city}, {address.state} {address.zipCode}
                      </div>
                      <div className="font-medium">{address.country}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{address.phoneNumber}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-100">
                  {!address.isDefault && (
                    <SetToDefaultButton addressId={address.id} />
                  )}

                  <DeleteAddressButton addressId={address.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
