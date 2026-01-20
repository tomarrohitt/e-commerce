import { Address } from "@/types";
import api from "./server";

export async function getAddresses(): Promise<Address[]> {
  const response = await api.get("/addresses");
  return response.data.data;
}
