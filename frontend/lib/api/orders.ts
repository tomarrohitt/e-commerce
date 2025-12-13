import { api } from "./client";
import type { OrdersListResponse, PaginatedOrders } from "@/types";

export const orderService = {
  async createOrder(data: {
    shippingAddressId: string;
    paymentMethod?: "stripe" | "cod";
  }) {
    const response = await api.post("/orders", data);
    return response.data;
  },

  async getOrder(id: string) {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedOrders> {
    const response = await api.get<OrdersListResponse>("/orders", { params });
    return response.data.data;
  },

  async cancelOrder(id: string) {
    const response = await api.post(`/orders/${id}/cancel`);
    return response.data;
  },

  async getOrderSummary() {
    const response = await api.get("/orders/summary");
    return response.data.data;
  },

  async downloadInvoice(orderId: string): Promise<string> {
    const response = await api.get(`/invoice/download/${orderId}`);
    return response.data.url;
  },

  async updateOrderStatus(id: string, status: string) {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  async refundOrder(id: string, amount?: number) {
    const response = await api.post(`/orders/${id}/refund`, { amount });
    return response.data;
  },

  async getAllOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string;
  }) {
    const response = await api.get("/orders/admin/all", { params });
    return response.data;
  },
};
