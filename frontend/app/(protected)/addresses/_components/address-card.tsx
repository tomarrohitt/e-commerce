import { CheckCircle, Home, MapPin, Phone } from "lucide-react";
import { DeleteAddressButton } from "./delete-address-button";
import { SetToDefaultButton } from "./set-to-default-button";
import { AddressDialog } from "@/components/address-modal";
import { cn } from "@/lib/utils";
import { entranceAnim } from "@/lib/constants/enter-animation";

export const AddressCard = ({ address, i }: { address: any; i: number }) => {
  return (
    <div
      key={address.id}
      style={{ animationDelay: `${100 + i * 100}ms` }}
      className={cn(
        `relative bg-white rounded-xl border flex flex-col transition-shadow ${entranceAnim}`,
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
                  address.isDefault ? "text-blue-600" : "text-slate-500",
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
          {!address.isDefault && <SetToDefaultButton addressId={address.id} />}

          <DeleteAddressButton addressId={address.id} />
        </div>
      </div>
    </div>
  );
};
