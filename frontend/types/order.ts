import { Pagination } from "./common";
import { GetAddressObj } from "./user";

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
  shippingAddress: GetAddressObj;
  billingAddress?: GetAddressObj;

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
