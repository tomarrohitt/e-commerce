import { useState, useCallback } from "react";
import type { Address } from "@/types";

export function useAddressModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const openAddModal = useCallback(() => {
    setEditingAddress(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((address: Address) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingAddress(null);
  }, []);

  return {
    isModalOpen,
    editingAddress,
    openAddModal,
    openEditModal,
    closeModal,
  };
}
