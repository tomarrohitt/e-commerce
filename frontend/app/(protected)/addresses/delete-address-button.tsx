"use client";
import { deleteAddress } from "@/actions/address";
import { Spinner } from "@/components/ui/spinner";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";

export const DeleteAddressButton = ({ addressId }: { addressId: string }) => {
  const [pending, startTransition] = useTransition();

  const handleDelete = async () => {
    startTransition(async () => {
      await deleteAddress(addressId);
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
    >
      {pending ? (
        <Spinner className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  );
};
