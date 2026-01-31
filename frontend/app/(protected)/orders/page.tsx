import { OrderCard } from "./_components/order-card";
import { Button } from "@/components/ui/button";
import { getOrders } from "@/lib/services/orders";
import { entranceAnim } from "@/lib/constants/enter-animation";
import Link from "next/link";

export default async function OrdersPage() {
  const { orders } = await getOrders();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className={`mb-8 ${entranceAnim}`}>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-500">View and track all your orders</p>
      </div>

      <div
        className={`space-y-6 ${entranceAnim}`}
        style={{
          animationDelay: "80ms",
        }}
      >
        {orders.length === 0 ? (
          <EmptyOrdersState />
        ) : (
          orders?.map((order, index) => (
            <OrderCard key={order.id} order={order} index={index} />
          ))
        )}
      </div>
    </div>
  );
}

function EmptyOrdersState() {
  return (
    <div
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${entranceAnim}`}
      style={{
        animationDelay: "100ms",
      }}
    >
      <div className="bg-white rounded-xl shadow-md p-12 text-center">
        <div className="text-6xl mb-4">📦</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
        <p className="text-gray-500 mb-6">
          Start shopping to see your orders here
        </p>
        <Link href="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    </div>
  );
}
