"use server";

import api from "@/lib/api";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";

type CreateOrderInput = {
  items: {
    productId: string;
    thumbnail: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phoneNumber: string;
  };
  totalAmount: number;
};

export const createOrder = async (data: CreateOrderInput) => {
  let orderId: string;
  try {
    const response = await api.post("/orders", data);
    orderId = response.data.data.orderId;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
  redirect(`/orders/${orderId}`);
};

export const cancelOrder = async (orderId: string) => {
  try {
    await api.post(`/orders/${orderId}/cancel`);
    refresh();
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};
export const downloadInvoice = async (orderId: string): Promise<string> => {
  try {
    const response = await api.get(`/invoice/download/${orderId}`);
    return response.data.url;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};
