import { api } from "./client";
import type { CreateAddressInput, Address } from "@/types";

export const addressService = {
  async getAddresses() {
    const response = await api.get("/addresses");
    return response.data.data;
  },

  async getAddress(id: string) {
    const response = await api.get(`/addresses/${id}`);
    return response.data;
  },

  async getAddressCount() {
    const response = await api.get("/addresses/count");
    return response.data.data;
  },

  async createAddress(data: CreateAddressInput): Promise<Address> {
    const response = await api.post("/addresses", data);
    return response.data;
  },

  async updateAddress(
    id: string,
    data: {
      type?: "shipping" | "billing";
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    },
  ) {
    const response = await api.patch(`/addresses/${id}`, data);
    return response.data;
  },

  async deleteAddress(id: string) {
    const response = await api.delete(`/addresses/${id}`);
    return response.data;
  },

  async setDefaultAddress(id: string) {
    const response = await api.patch(`/addresses/${id}/default`);
    return response.data;
  },

  async getDefaultAddress() {
    const response = await api.get("/addresses/default");
    return response.data;
  },
};
