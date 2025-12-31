export type ProductFilterType = {
  page: number;
  limit: number;
  search?: string;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: string;
};

export type ListAddressFilter = {
  page?: number;
  limit?: number;
  search?: string;
  zipCode?: string;
  state?: string;
  city?: string;
  userId: string;
};

export type CartItem = {
  productId: string;
  quantity: number;
  addedAt: Date;
};

export interface CartItemWithProduct extends CartItem {
  product: {
    productId: string;
    name: string;
    price: number;
    thumbnail: string;
    stockQuantity: number;
    sku: string;
  };
}

export interface Cart {
  items: CartItemWithProduct[];
  totalItems: number;
  subtotal: number;
  tax: number;
  totalAmount: number;
}

export type ValidateUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified?: boolean;
  role?: string | null;
};
