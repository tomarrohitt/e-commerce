import { CartItemWithProduct } from "@/types";
import { CartItem } from "./cart-item";

const entranceAnim =
  "animate-in fade-in slide-in-from-bottom-4 duration-600 ease-out fill-mode-both";

export const CartItemList = ({ items }: { items: CartItemWithProduct[] }) => {
  return (
    <div className="lg:col-span-2 space-y-4">
      {items.map((item, i) => (
        <div
          key={item.productId}
          className={`${entranceAnim} delay-${100 + i * 100}`}
        >
          <CartItem item={item} isUpdating={false} />
        </div>
      ))}
    </div>
  );
};
