import { getUserFromSession } from "@/lib/user-auth";
import { getTotalOrdersCount } from "@/lib/api/orders";
import { getCartCount } from "@/lib/api/cart";
import { getAddressCount } from "@/lib/api/addresses";
import Link from "next/link";
import { entranceAnim } from "@/lib/enter-animation";

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

  const options = [
    {
      icon: "🛍️",
      title: "Browse Products",
      description: "Discover items",
      href: "/products",
    },
    {
      icon: "📦",
      title: "View Orders",
      description: "Track purchases",
      href: "/orders",
    },
    {
      icon: "⚙️",
      title: "Profile",
      description: "Manage account",
      href: "/profile",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Block */}
      <div className="bg-linear-to-r from-blue-500 to-indigo-700 rounded-2xl p-8 text-white mb-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-blue-100 opacity-90">
          Here&apos;s what&apos;s happening with your account today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div
            key={stat.title}
            className={`h-full ${entranceAnim} delay-${100 * i}`}
          >
            <Link href={stat.href} className="block h-full group">
              <div className="bg-white rounded-xl shadow-md p-6 h-full border border-transparent transition-all duration-300 hover:shadow-lg hover:border-blue-100 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-500">
                  {stat.title}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2
          className={`text-xl font-bold text-gray-900 mb-6 ${entranceAnim} delay-300`}
        >
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {options.map((action, i) => {
            const delay = 300 + i * 100;
            return (
              <Link key={action.title} href={action.href} className="group">
                <div
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300 cursor-pointer hover:-translate-y-0.5 hover:shadow-sm ${entranceAnim} delay-${delay}`}
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-lg shrink-0 text-xl transition-transform duration-300 group-hover:scale-110">
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">
                      {action.title}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {action.description}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div
        className={`bg-white rounded-xl shadow-md p-6 ${entranceAnim} delay-700`}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Account Information
        </h2>

        <div className="space-y-0">
          {[
            { label: "Email", value: user?.email },
            { label: "Name", value: user?.name },
            { label: "Role", value: user?.role },
            {
              label: "Status",
              value: user?.emailVerified ? "Verified" : "Unverified",
            },
            {
              label: "Member Since",
              value: user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })
                : "N/A",
            },
          ].map((row, i) => (
            <div
              key={row.label}
              className={`flex justify-between items-center py-3 transition-colors hover:bg-gray-50/50 px-2 rounded-md ${
                i !== 4 ? "border-b border-gray-100" : ""
              }`}
            >
              <span className="text-sm font-medium text-gray-500">
                {row.label}
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
