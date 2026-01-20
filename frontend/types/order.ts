import { Pagination } from "./common";
import { Address } from "./user";

export interface OrderItem {
  productId: string;
  name: string;
  price: string;
  thumbnail: string;
  quantity: number;
}

export type Order = {
  id: string;
  totalAmount: string;
  status: string;
  currency: string;
  invoiceUrl: string | null;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: Address;
};

export interface OrderExtended extends Order {
  userId: string;
  userEmail: string;
  userName: string;

  subtotal: string;
  tax: string;

  paid: boolean;
  refunded: boolean;

  paymentId: string | null;
  paymentClientSecret: string | null;
  billingAddress: Address;

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

export type ListOrderInput = Partial<{
  page: number;
  limit: number;
  sortBy: "totalAmount" | "createdAt";
  sortOrder: "asc" | "desc";
  status?:
    | "PAID"
    | "FAILED"
    | "CANCELLED"
    | "DELIVERED"
    | "REFUNDED"
    | "AWAITING_PAYMENT";
}>;
