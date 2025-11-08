// src/types/index.ts

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: "user" | "seller" | "admin";
  emailVerified: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  session: {
    token: string;
    expiresAt: string;
  };
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface ApiError {
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

// src/types/index.ts (ADD these)

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  sku: string;
  images: string[];
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedProducts {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  _count?: {
    products: number;
  };
}

export interface Address {
  id: string;
  userId: string;
  type: "shipping" | "billing";
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  paymentMethod: string | null;
  stripePaymentIntentId: string | null;
  shippingAddressId: string;
  createdAt: Date;
  updatedAt: Date;
  orderItems: OrderItem[];
  shippingAddress: Address;
  clientSecret?: string; // For Stripe
  paymentIntentId?: string; // For Stripe
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number;
  product: {
    id: string;
    name: string;
    images: string[];
  };
}

export interface CreateOrderRequest {
  shippingAddressId: string;
  paymentMethod?: "stripe" | "cod";
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface PaginatedOrders {
  orders: Order[];
  pagination: Pagination;
}

export interface PaginatedProducts {
  products: Product[];
  pagination: Pagination;
}
