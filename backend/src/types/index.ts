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
    id: string;
    name: string;
    price: number;
    images: string[];
    stockQuantity: number;
  };
}

export interface Cart {
  items: CartItemWithProduct[];
  totalItems: number;
  totalPrice: number;
}
