import { CartItemWithProduct } from "@/types";
import { CartItem } from "./cart-item";

export const CartItemList = ({ items }: { items: CartItemWithProduct[] }) => {
  return (
    <div className="lg:col-span-2 space-y-4">
      {items.map((item, i) => (
        <div
          key={item.productId}
          style={{ animationDelay: `${100 + i * 100}ms` }}
        >
          <CartItem item={item} isUpdating={false} />
        </div>
      ))}
    </div>
  );
};
