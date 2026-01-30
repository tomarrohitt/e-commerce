import { Address } from "@/types";
import { api } from "@/lib/clients/server";
import { getUserFromSession } from "@/actions/session";

export async function getAddress(id: string): Promise<Address> {
  const res = await api(`/addresses/${id}`);

  if (!res.ok) {
    const err = await res.json();
    throw err;
  }

  return await res.json();
}

export async function getAddressCount() {
  const res = await api("/addresses/count", {
    cache: "force-cache",
    next: { tags: [`address-count-${(await getUserFromSession())!.id}`] },
  });

  if (!res.ok) {
    const err = await res.json();
    throw err;
  }

  const json = await res.json();
  return json.data;
}
