import { getAddresses } from "@/lib/services/addresses-cached";
import { Home } from "lucide-react";

import { AddressDialog } from "@/components/address-modal";

import { AddressCard } from "./_components/address-card";

import Address from "@/public/lottie/delivery.json";
import { LottieAnimation } from "@/components/lottie";

export default async function AddressesPage() {
  const { data: addresses } = await getAddresses();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      {addresses.length === 0 ? (
        <NoAddresses />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h1
                className={`text-3xl font-bold text-slate-900 flex items-center gap-3`}
              >
                <Home className="w-8 h-8 text-blue-500" />
                My Addresses
              </h1>
              <p className={`mt-2 text-slate-500 delay-75`}>
                Manage your shipping and billing addresses
              </p>
            </div>
            <div className="mr-20">
              {addresses.length > 0 && <AddressDialog />}
            </div>
          </div>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 md:grid-cols-2">
              {addresses.map((address, i) => (
                <AddressCard key={address.id} address={address} i={i} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function NoAddresses() {
  return (
    <div className="text-center px-6 relative mt-6 flex justify-center items-center flex-col">
      <div className="absolute flex justify-center items-center mb-24 -z-20">
        <LottieAnimation data={Address} className="size-180" />
      </div>
      <div className="size-80" />

      <p className={`text-slate-500 mb-6 max-w-md mx-auto delay-75`}>
        Add a shipping address to continue with checkout.
      </p>
      <div className="max-w-3xl">
        <AddressDialog />
      </div>
    </div>
  );
}
