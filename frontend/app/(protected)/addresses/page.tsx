import { getAddresses } from "@/lib/api/addresses-cached";
import { Home } from "lucide-react";

import { AddressList } from "./address-list";
import { AddressDialog } from "@/components/address-modal";

export default async function AddressesPage() {
  const { data: addresses } = await getAddresses();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Home className="w-8 h-8 text-blue-500" />
                My Addresses
              </h1>
              <p className="mt-2 text-slate-500">
                Manage your shipping and billing addresses
              </p>
            </div>

            {addresses.length > 0 && <AddressDialog />}
          </div>
        </div>

        <AddressList addresses={addresses} />
      </div>
    </div>
  );
}
