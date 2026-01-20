import { Address } from "@/types";
import api from "./server";

export async function getAddress(id: string): Promise<Address> {
  const response = await api.get(`/addresses/${id}`);
  return response.data;
}

export async function getAddressCount() {
  const response = await api.get("/addresses/count");
  return response.data.data;
}
