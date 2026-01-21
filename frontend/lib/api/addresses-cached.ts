import { Address } from "@/types";
import { api } from "./server";

export async function getAddresses(): Promise<{ data: Address[] }> {
  const res = await api("/addresses");

  if (!res.ok) {
    throw new Error(`Failed to fetch addresses: ${res.status}`);
  }

  return res.json();
}
