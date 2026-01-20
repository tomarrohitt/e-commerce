import api from "./server";
import type {
  OrderExtended,
  OrdersListResponse,
  PaginatedOrders,
} from "@/types";

export async function getOrder(id: string): Promise<OrderExtended> {
  const response = await api.get(`/orders/${id}`);
  return response.data.data;
}

export async function getOrders(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<PaginatedOrders> {
  const response = await api.get<OrdersListResponse>("/orders", { params });

  return response.data.data;
}

export async function cancelOrder(id: string) {
  const response = await api.post(`/orders/${id}/cancel`);
  return response.data;
}

export async function getOrderSummary() {
  const response = await api.get("/orders/summary");
  return response.data.data;
}

export async function downloadInvoice(orderId: string): Promise<string> {
  const response = await api.get(`/invoice/download/${orderId}`);
  return response.data.url;
}

export async function updateOrderStatus(id: string, status: string) {
  const response = await api.patch(`/orders/${id}/status`, { status });
  return response.data;
}

export async function getTotalOrdersSpend(): Promise<{ total: number }> {
  const response = await api.get("/orders/total");
  return response.data.data;
}
export async function getTotalOrdersCount(): Promise<{
  total: number;
  pending: number;
  completed: number;
}> {
  const response = await api.get("/orders/summary");
  return response.data.data;
}
export async function refundOrder(id: string, amount?: number) {
  const response = await api.post(`/orders/${id}/refund`, { amount });
  return response.data;
}

export async function getAllOrders(params?: {
  page?: number;
  limit?: number;
  status?: string;
  userId?: string;
}) {
  const response = await api.get("/orders/admin/all", { params });
  return response.data;
}
