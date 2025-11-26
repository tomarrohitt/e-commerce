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
    images: string[];
    stockQuantity: number;
  };
}

export interface Cart {
  items: CartItemWithProduct[];
  totalItems: number;
  totalPrice: number;
}
