export type CartItem = {
  productId: string;
  quantity: number;
  addedAt: Date | string;
};

export interface CartItemWithProduct extends CartItem {
  product: {
    id: string;
    name: string;
    price: number;
    thumbnail: string;
    stockQuantity: number;
  };
}

export interface Cart {
  items: CartItemWithProduct[];
  totalItems: number;
  totalAmoumt: number;
}
