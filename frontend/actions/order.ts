"use server";

import { api } from "@/lib/api/server";
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
    const res = await api("/orders", {
      method: "POST",
      body: data,
    });

    if (!res.ok) {
      const err = await res.json();
      throw err;
    }

    const json = await res.json();
    orderId = json.data.orderId;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }

  redirect(`/orders/${orderId}`);
};

export const cancelOrder = async (orderId: string) => {
  try {
    const res = await api(`/orders/${orderId}/cancel`, {
      method: "POST",
    });

    if (!res.ok) {
      const err = await res.json();
      throw err;
    }
  } catch (error) {
    console.error("Error canceling order:", error);
    throw error;
  }
};

export const downloadInvoice = async (orderId: string): Promise<string> => {
  try {
    const res = await api(`/invoice/download/${orderId}`);

    if (!res.ok) {
      const err = await res.json();
      throw err;
    }

    const json = await res.json();
    return json.url;
  } catch (error) {
    console.error("Error downloading invoice:", error);
    throw error;
  }
};
