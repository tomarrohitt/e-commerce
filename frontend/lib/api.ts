// src/lib/api.ts
import axios, { AxiosError } from "axios";
import type { PaginatedProducts, Category } from "@/types";
import { CloudCog } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token if needed
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const data = error.response.data as any;
      if (error.response.status === 401) {
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/sign-in")
        ) {
          window.location.href = "/sign-in";
        }
      }

      return Promise.reject(data);
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({ error: "No response from server" });
    } else {
      // Something else happened
      return Promise.reject({ error: error.message });
    }
  },
);

// src/lib/api.ts (ADD these functions at the end)

export const productService = {
  /**
   * Get all products with filters
   */
  async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
  }): Promise<PaginatedProducts> {
    const response = await api.get("/products", { params });
    return response.data;
  },

  /**
   * Get single product
   */
  async getProduct(id: string) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
};

export const addressService = {
  /**
   * Get all addresses for current user
   */
  async getAddresses() {
    const response = await api.get("/address");
    return response.data;
  },

  /**
   * Get single address
   */
  async getAddress(id: string) {
    const response = await api.get(`/address/${id}`);
    return response.data;
  },

  /**
   * Get address count for current user
   */
  async getAddressCount() {
    const response = await api.get("/address/count");
    return response.data;
  },

  /**
   * Create new address
   */
  async createAddress(data: {
    type: "shipping" | "billing";
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }) {
    const response = await api.post("/address", data);
    return response.data;
  },

  /**
   * Update address
   */
  async updateAddress(
    id: string,
    data: {
      type?: "shipping" | "billing";
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    },
  ) {
    const response = await api.patch(`/address/${id}`, data);
    return response.data;
  },

  /**
   * Delete address
   */
  async deleteAddress(id: string) {
    const response = await api.delete(`/address/${id}`);
    return response.data;
  },

  /**
   * Set address as default
   */
  async setDefaultAddress(id: string) {
    const response = await api.patch(`/address/${id}/default`);
    return response.data;
  },

  /**
   * Get default address
   */
  async getDefaultAddress() {
    const response = await api.get("/address/default");
    return response.data;
  },
};

export const orderService = {
  /**
   * Create order from cart
   */
  async createOrder(data: {
    shippingAddressId: string;
    paymentMethod?: "stripe" | "cod";
  }) {
    const response = await api.post("/orders", data);
    return response.data;
  },

  /**
   * Get single order
   */
  async getOrder(id: string) {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  /**
   * Get all orders for current user
   */
  async getOrders(params?: { page?: number; limit?: number; status?: string }) {
    const response = await api.get("/orders", { params });
    return response.data;
  },

  /**
   * Cancel order
   */
  async cancelOrder(id: string) {
    const response = await api.post(`/orders/${id}/cancel`);
    return response.data;
  },

  /**
   * Get order summary
   */
  async getOrderSummary() {
    const response = await api.get("/orders/summary");
    return response.data;
  },

  // Admin only endpoints
  /**
   * Update order status (admin only)
   */
  async updateOrderStatus(id: string, status: string) {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  /**
   * Refund order (admin only)
   */
  async refundOrder(id: string, amount?: number) {
    const response = await api.post(`/orders/${id}/refund`, { amount });
    return response.data;
  },

  /**
   * Get all orders (admin only)
   */
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

// src/lib/api.ts (UPDATE categoryService)

export const categoryService = {
  /**
   * Get all categories
   */
  async getCategories() {
    const response = await api.get("/category");
    return response.data;
  },

  /**
   * Get single category
   */
  async getCategory(id: string) {
    const response = await api.get(`/category/${id}`);
    return response.data;
  },

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string) {
    const response = await api.get(`/category/slug/${slug}`);
    return response.data;
  },
};

export const cartService = {
  /**
   * Add item to cart
   */
  async addToCart(productId: string, quantity: number) {
    const response = await api.post("/cart", { productId, quantity }); // Changed from /cart/items
    return response.data;
  },

  /**
   * Get cart
   */
  async getCart() {
    const response = await api.get("/cart");
    return response.data;
  },

  /**
   * Update cart item quantity
   */
  async updateCartItem(productId: string, quantity: number) {
    const response = await api.patch(`/cart/${productId}`, { quantity }); // Changed from /cart/items/:id
    console.log({ response });

    return response.data;
  },

  /**
   * Remove item from cart
   */
  async removeFromCart(productId: string) {
    const response = await api.delete(`/cart/${productId}`); // Changed from /cart/items/:id
    return response.data;
  },

  /**
   * Clear cart
   */
  async clearCart() {
    const response = await api.delete("/cart");
    return response.data;
  },

  /**
   * Get cart count
   */
  async getCartCount() {
    const response = await api.get("/cart/count");
    return response.data;
  },

  /**
   * Validate cart
   */
  async validateCart() {
    const response = await api.get("/cart/validate");
    return response.data;
  },
};

export default api;
