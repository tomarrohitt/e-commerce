"use client";

import { useState } from "react";
import { Edit, Plus } from "lucide-react";
import { Modal } from "./modal";
import AddAddressForm from "./add-address-form";
import { Address } from "@/types";
import EditAddressForm from "./edit-address-form";

export function AddressDialog({ address }: { address?: Address }) {
  const [open, setOpen] = useState(false);
  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      title="Edit Shipping Address"
      description="Fill in the details to save the edited delivery address."
      button={
        address ? (
          <button className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
            <Edit className="w-4 h-4" />
            Edit
          </button>
        ) : (
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 font-medium">
            <Plus className="w-5 h-5" />
            Add New Address
          </button>
        )
      }
    >
      {address ? (
        <EditAddressForm address={address} setOpen={setOpen} />
      ) : (
        <AddAddressForm setOpen={setOpen} />
      )}
    </Modal>
  );
}
