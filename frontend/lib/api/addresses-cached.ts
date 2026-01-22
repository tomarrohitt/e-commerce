import { Address } from "@/types";
import { api } from "./server";
import { getUserFromSession } from "../user-auth";

export async function getAddresses(): Promise<{ data: Address[] }> {
  const user = await getUserFromSession();

  const res = await api("/addresses", {
    cache: "force-cache",
    next: {
      tags: [`addresses-${user!.id}`],
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch addresses: ${res.status}`);
  }

  return res.json();
}
