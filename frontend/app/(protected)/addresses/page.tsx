import { getAddresses } from "@/lib/api/addresses-cached";
import { getTokenFromSession, getUserFromSession } from "@/lib/user-auth";
import { Address } from "@/types";
import { CheckCircle, Edit, Home, MapPin, Phone, Plus } from "lucide-react";
import { SetToDefaultButton } from "./set-to-default-button";
import { DeleteAddressButton } from "./delete-address-button";

import { Modal } from "@/components/modal";
import AddAddressForm from "@/components/add-address-form";
import { Button } from "@/components/ui/button";
import EditAddressForm from "@/components/edit-address-form";

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
            {addresses.length > 0 && (
              <Modal
                title="Add Shipping Address"
                description="Fill in the details to save a new delivery address."
                button={
                  <Button className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 font-medium">
                    <Plus className="w-5 h-5" />
                    Add New Address
                  </Button>
                }
              >
                <AddAddressForm />
              </Modal>
            )}
          </div>
        </div>

        {addresses.length === 0 ? (
          <NoAddressesFound />
        ) : (
          <AddressList addresses={addresses} />
        )}
      </div>
    </div>
  );
}

const NoAddressesFound = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <MapPin className="w-10 h-10 text-slate-400" />
      </div>
      <h2 className="text-2xl font-semibold text-slate-900 mb-3">
        No Addresses Found
      </h2>
      <p className="text-slate-500 mb-8 max-w-md mx-auto">
        Add a shipping address to get started with checkout and enjoy faster
        delivery.
      </p>
      <Modal
        title="Add Shipping Address"
        description="Fill in the details to save a new delivery address."
        button={
          <Button className="inline-flex items-center gap-2 py-2  bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 font-medium">
            <Plus className="w-5 h-5" />
            Add New Address
          </Button>
        }
      >
        <AddAddressForm />
      </Modal>
    </div>
  );
};

const AddressList = ({ addresses }: { addresses: Address[] }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      {addresses.map((address) => (
        <div
          key={address.id}
          className={`bg-white rounded-xl border-2 transition-all hover:shadow-lg flex flex-col ${
            address.isDefault
              ? "border-blue-500 shadow-md"
              : "border-slate-200 hover:border-blue-300"
          }`}
        >
          <div className="p-6 flex flex-col flex-1">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    address.isDefault ? "bg-blue-100" : "bg-slate-100"
                  }`}
                >
                  <Home
                    className={`w-5 h-5 ${
                      address.isDefault ? "text-blue-500" : "text-slate-500"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {address.name}
                  </h3>
                  {address.isDefault && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full mt-1">
                      <CheckCircle className="w-3 h-3" />
                      Default Address
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-5 flex-1">
              <div className="flex items-start gap-2 text-slate-700">
                <MapPin className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                <div className="text-sm leading-relaxed">
                  <div>{address.street}</div>
                  <div>
                    {address.city}, {address.state} {address.zipCode}
                  </div>
                  <div className="font-medium">{address.country}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-sm">{address.phoneNumber}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-slate-100 mt-auto">
              {!address.isDefault && (
                <SetToDefaultButton addressId={address.id} />
              )}

              <Modal
                title="Edit Shipping Address"
                description="Fill in the details to save the edited delivery address."
                button={
                  <button className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                }
              >
                <EditAddressForm address={address} />
              </Modal>
              <DeleteAddressButton addressId={address.id} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
