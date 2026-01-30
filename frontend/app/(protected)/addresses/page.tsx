import { getAddresses } from "@/lib/services/addresses-cached";
import { Home, MapPin } from "lucide-react";

import { AddressDialog } from "@/components/address-modal";

import { entranceAnim } from "@/lib/constants/enter-animation";
import { AddressCard } from "./_components/address-card";

export default async function AddressesPage() {
  const { data: addresses } = await getAddresses();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      <div className="flex justify-between items-center">
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
        <div className="mr-20">{addresses.length > 0 && <AddressDialog />}</div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">{addresses.length === 0 && <NoAddresses />}</div>

        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address, i) => (
            <AddressCard key={address.id} address={address} i={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function NoAddresses() {
  return (
    <div className="bg-white rounded-xl shadow-md p-12 text-center px-6 py-16 mt-10">
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
