"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addressService } from "@/lib/api";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import type { Address } from "@/types"; // Import your Address type

// Define the shape of the form data
type AddressFormData = {
  type: "shipping" | "billing";
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

// 1. Update props to accept an address
interface AddAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  addressToEdit: Address | null; // This is the new prop
}

const defaultFormState: AddressFormData = {
  type: "shipping",
  street: "",
  city: "",
  state: "",
  zipCode: "",
  country: "India",
};

export default function AddAddressModal({
  isOpen,
  onClose,
  addressToEdit,
}: AddAddressModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<AddressFormData>(defaultFormState);

  // 2. Check if we are in "edit mode"
  const isEditing = !!addressToEdit;

  // 3. Pre-fill the form when the modal opens in edit mode
  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        // We have an address to edit, fill the form
        setFormData({
          type: addressToEdit.type,
          street: addressToEdit.street,
          city: addressToEdit.city,
          state: addressToEdit.state,
          zipCode: addressToEdit.zipCode,
          country: addressToEdit.country,
        });
      } else {
        // No address, reset to default (for "Add New")
        setFormData(defaultFormState);
      }
    }
  }, [isOpen, addressToEdit, isEditing]); // Re-run when modal opens or edit target changes

  // 4. Create mutation (for creating new addresses)
  const { mutate: createAddress, isPending: isCreating } = useMutation({
    mutationFn: (data: AddressFormData) => addressService.createAddress(data),
    onSuccess: () => {
      toast.success("Address added successfully!");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.error || "Failed to add address");
    },
  });

  // 5. Update mutation (for editing existing addresses)
  const { mutate: updateAddress, isPending: isUpdating } = useMutation({
    mutationFn: (data: AddressFormData) => {
      // We know addressToEdit is not null if isEditing is true
      return addressService.updateAddress(addressToEdit!.id, data);
    },
    onSuccess: () => {
      toast.success("Address updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.error || "Failed to update address");
    },
  });

  // Combine loading states
  const isPending = isCreating || isUpdating;

  // Form input handlers (no change)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 6. Make the submit handler conditional
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateAddress(formData);
    } else {
      createAddress(formData);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        {/* 7. Dynamic Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Edit Address" : "Add New Address"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form (no changes to inputs) */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Address Type */}
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Address Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="shipping">Shipping</option>
              <option value="billing">Billing</option>
            </select>
          </div>

          {/* Street */}
          <div>
            <label
              htmlFor="street"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Street Address
            </label>
            <input
              type="text"
              id="street"
              name="street"
              value={formData.street}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Grid for City, State, Zip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label
                htmlFor="state"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                State
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label
                htmlFor="zipCode"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ZIP Code
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Country */}
          <div>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Country
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors disabled:opacity-50"
            >
              {/* 8. Dynamic Button Text */}
              {isPending
                ? "Saving..."
                : isEditing
                ? "Save Changes"
                : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
