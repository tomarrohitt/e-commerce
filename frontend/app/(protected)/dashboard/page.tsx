import { getUserFromSession } from "@/lib/user-auth";
import { getTotalOrdersCount } from "@/lib/api/orders";
import { getCartCount } from "@/lib/api/cart";
import { getAddressCount } from "@/lib/api/addresses";
import DashboardClient from "./dashboard-animated";
import { User } from "@/types";

export default async function DashboardPage() {
  const [user, cartCount, addressCount, ordersCount] = await Promise.all([
    getUserFromSession(),
    getCartCount(),
    getAddressCount(),
    getTotalOrdersCount(),
  ]);

  const stats = [
    {
      title: "Total Orders",
      value: ordersCount.total,
      icon: "📦",
      href: "/orders",
    },
    {
      title: "Cart Items",
      value: cartCount.data.count,
      icon: "🛒",
      href: "/cart",
    },
    {
      title: "Wishlist",
      value: 0,
      icon: "❤️",
      href: "/wishlist",
    },
    {
      title: "Addresses",
      value: addressCount.count,
      icon: "📍",
      href: "/addresses",
    },
  ];

  return <DashboardClient user={user as User} stats={stats} />;
}
