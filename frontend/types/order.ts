import { Pagination } from "./common";
import { Address } from "./user";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  name: string;
  sku: string;
  price: string;
  thumbnail: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;

  subtotal: string;
  tax: string;
  totalAmount: string;
  currency: string;

  paid: boolean;
  refunded: boolean;

  status:
    | "AWAITING_PAYMENT"
    | "PAID"
    | "CANCELLED"
    | "SHIPPED"
    | "DELIVERED"
    | "REFUNDED";
  paymentId: string | null;
  paymentClientSecret: string | null;
  invoiceUrl: string | null;

  // Relations
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress?: Address;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponse {
  success: boolean;
  data: Order;
}

export interface PaginatedOrders {
  orders: Order[];
  pagination: Pagination;
}

export interface OrdersListResponse {
  success: boolean;
  data: PaginatedOrders;
}

export interface CreateOrderRequest {
  shippingAddressId: string;
  paymentMethod?: "stripe" | "cod";
}

export enum OrderStatusType {
  PENDING = "PENDING",
  CREATED = "CREATED",
  CONFIRMED = "CONFIRMED",
  PAID = "PAID",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export interface OrderItemsListProps {
  orderItems: Array<{
    productId: string;
    name: string;
    thumbnail: string;
    quantity: number;
    price: string;
  }>;
  status: string;
}

export type ListOrderInput = Partial<{
  page: number;
  limit: number;
  sortBy: "totalAmount" | "createdAt";
  sortOrder: "asc" | "desc";
  status?: "PAID" | "FAILED" | "CANCELLED" | "DELIVERED" | "REFUNDED";
}>;
