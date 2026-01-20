import Link from "next/link";

import { getUserFromSession } from "@/lib/user-auth";
import { getAddressCount, getCartCount, getTotalOrdersCount } from "@/lib/api";

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-linear-to-r from-blue-500 to-indigo-700 rounded-2xl p-8 text-white mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-blue-100">
          Here's what's happening with your account
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">{stat.icon}</span>
              <span className="text-3xl font-bold text-blue-500">
                {stat.value}
              </span>
            </div>
            <h3 className="text-gray-500 font-medium">{stat.title}</h3>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/products"
            className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <span className="text-2xl">🛍️</span>
            <div>
              <p className="font-semibold text-gray-900">Browse Products</p>
              <p className="text-sm text-gray-500">Discover new items</p>
            </div>
          </Link>

          <Link
            href="/orders"
            className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <span className="text-2xl">📦</span>
            <div>
              <p className="font-semibold text-gray-900">View Orders</p>
              <p className="text-sm text-gray-500">Track your purchases</p>
            </div>
          </Link>

          <Link
            href="/profile"
            className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <span className="text-2xl">⚙️</span>
            <div>
              <p className="font-semibold text-gray-900">Settings</p>
              <p className="text-sm text-gray-500">Manage your account</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Account Info */}
      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Account Information
        </h2>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <span className="text-gray-500">Email</span>
            <span className="font-medium text-gray-900">{user?.email}</span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <span className="text-gray-500">Name</span>
            <span className="font-medium text-gray-900">{user?.name}</span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <span className="text-gray-500">Role</span>
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-500 rounded-full text-sm font-medium">
              {user?.role}
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <span className="text-gray-500">Email Verified</span>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                user?.emailVerified
                  ? "bg-green-100 text-green-500"
                  : "bg-yellow-100 text-yellow-500"
              }`}
            >
              {user?.emailVerified ? "Verified ✓" : "Not Verified"}
            </span>
          </div>

          <div className="flex justify-between items-center py-3">
            <span className="text-gray-500">Member Since</span>
            <span className="font-medium text-gray-900">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
