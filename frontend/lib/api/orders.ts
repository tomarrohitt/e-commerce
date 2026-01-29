import { cache } from "react";
import { buildQuery } from "../build-query";
import { getUserFromSession } from "../user-auth";
import { api } from "./server";
import type {
  OrderExtended,
  OrdersListResponse,
  PaginatedOrders,
} from "@/types";

export async function getOrder(id: string): Promise<OrderExtended> {
  const res = await api(`/orders/${id}`);
  if (!res.ok) throw await res.json();
  const json = await res.json();
  return json.data;
}

export async function getOrders(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<PaginatedOrders> {
  const q = buildQuery(params);
  const res = await api(`/orders${q}`);
  if (!res.ok) throw await res.json();
  const json = (await res.json()) as OrdersListResponse;
  return json.data;
}

export async function cancelOrder(id: string) {
  const res = await api(`/orders/${id}/cancel`, { method: "POST" });
  if (!res.ok) throw await res.json();
  return await res.json();
}

export async function updateOrderStatus(id: string, status: string) {
  const res = await api(`/orders/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
  if (!res.ok) throw await res.json();
  return await res.json();
}

export const getTotalOrdersSpend = cache(
  async (): Promise<{ total: number }> => {
    const res = await api("/orders/total");

    if (!res.ok) throw await res.json();
    const json = await res.json();
    return json.data;
  },
);

export async function getTotalOrdersCount(): Promise<{
  total: number;
  pending: number;
  completed: number;
}> {
  const user = await getUserFromSession();

  const res = await api("/orders/summary", {
    cache: "force-cache",
    next: { tags: [`orders-summary-${user!.id}`] },
  });
  if (!res.ok) throw await res.json();
  const json = await res.json();
  return json.data;
}

export async function refundOrder(id: string, amount?: number) {
  const res = await api(`/orders/${id}/refund`, {
    method: "POST",
    body: { amount },
  });
  if (!res.ok) throw await res.json();
  return await res.json();
}

export async function getAllOrders(params?: {
  page?: number;
  limit?: number;
  status?: string;
  userId?: string;
}) {
  const q = buildQuery(params);
  const res = await api(`/orders/admin/all${q}`);
  if (!res.ok) throw await res.json();
  return await res.json();
}
