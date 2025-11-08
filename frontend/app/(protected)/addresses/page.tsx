"use client";

import { useState } from "react";
// Remove Link from next/link, we don't need it
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addressService } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import type { Address } from "@/types";
import toast from "react-hot-toast";
import { Plus, Home, Trash2, Edit, CheckCircle } from "lucide-react";
import AddAddressModal from "@/components/address-modal"; // Import the modal

export default function AddressesPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter(); // We don't use this, but I'll leave it in

  // 1. Add state to control the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 2. This state will hold the address we're editing
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const { data: addressData, isLoading: isAddressesLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressService.getAddresses(),
    enabled: isAuthenticated,
    staleTime: 0,
  });

  const addresses: Address[] = addressData?.addresses || [];

  // ... (delete mutation is unchanged)
  const { mutate: deleteAddress, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => addressService.deleteAddress(id),
    onSuccess: () => {
      toast.success("Address deleted");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: (error: any) => {
      toast.error(error.error || "Failed to delete address");
    },
  });

  // ... (setDefault mutation is unchanged)
  const { mutate: setDefaultAddress, isPending: isSettingDefault } =
    useMutation({
      mutationFn: (id: string) => addressService.setDefaultAddress(id),
      onSuccess: () => {
        toast.success("Default address updated");
        queryClient.invalidateQueries({ queryKey: ["addresses"] });
      },
      onError: (error: any) => {
        toast.error(error.error || "Failed to set default address");
      },
    });

  const isLoading = isAuthLoading || isAddressesLoading;

  // 3. Handlers to open/close the modal
  const openAddModal = () => {
    setEditingAddress(null); // Set to null for "add" mode
    setIsModalOpen(true);
  };

  const openEditModal = (address: Address) => {
    setEditingAddress(address); // Pass the address for "edit" mode
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // We can set editingAddress to null on close
    setEditingAddress(null);
  };

  if (isLoading) {
    return <AddressSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Addresses</h1>

        {/* 4. Update button to use the handler */}
        <button
          onClick={openAddModal}
          className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Address
        </button>
      </div>

      {/* Empty State */}
      {addresses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Home className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Addresses Found
          </h2>
          <p className="text-gray-600 mb-6">
            Add a shipping address to get started with checkout.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Add Your First Address
          </button>
        </div>
      ) : (
        // Address List
        <div className="space-y-6">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <div className="p-6 flex justify-between items-start">
                {/* ... (address details) ... */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-semibold text-gray-900 capitalize">
                      {address.type} Address
                    </span>
                    {address.isDefault && (
                      <span className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                        <CheckCircle className="w-4 h-4" /> Default
                      </span>
                    )}
                  </div>
                  <address className="text-gray-600 not-italic">
                    {address.street} <br />
                    {address.city}, {address.state} {address.zipCode} <br />
                    {address.country}
                  </address>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {/* 5. Update Edit button to use handler */}
                  <button
                    onClick={() => openEditModal(address)}
                    className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      if (
                        confirm("Are you sure you want to delete this address?")
                      ) {
                        deleteAddress(address.id);
                      }
                    }}
                    disabled={isDeleting}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {/* Set as Default Button */}
              {!address.isDefault && (
                <div className="bg-gray-50 px-6 py-3">
                  <button
                    onClick={() => setDefaultAddress(address.id)}
                    disabled={isSettingDefault}
                    className="text-sm font-medium text-purple-600 hover:text-purple-800 disabled:opacity-50"
                  >
                    {isSettingDefault ? "Setting..." : "Set as Default"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 6. Render the modal with the correct props */}
      <AddAddressModal
        isOpen={isModalOpen}
        onClose={closeModal}
        addressToEdit={editingAddress}
      />
    </div>
  );
}

// Skeleton component (unchanged)
function AddressSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8 animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/3"></div>
        <div className="h-10 bg-gray-300 rounded-lg w-40"></div>
      </div>
      <div className="space-y-6 animate-pulse">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-md">
            <div className="p-6">
              <div className="h-5 bg-gray-300 rounded w-1/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4">
              <div className="h-4 bg-gray-300 rounded w-32"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
