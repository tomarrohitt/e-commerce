"use client";

import { useState } from "react";
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
      address={!!address}
    >
      {address ? (
        <EditAddressForm address={address} setOpen={setOpen} />
      ) : (
        <AddAddressForm setOpen={setOpen} />
      )}
    </Modal>
  );
}
