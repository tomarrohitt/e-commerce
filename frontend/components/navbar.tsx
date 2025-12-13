"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";

export default function Navbar() {
  const { cartCount } = useCart();

  const { user, isAuthenticated, signOut, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const renderAuthSection = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-end space-x-4 animate-pulse min-w-40">
          <div className="h-5 w-12 bg-gray-200 rounded"></div>
          <div className="h-8 w-20 bg-gray-200 rounded-lg"></div>
        </div>
      );
    }

    if (isAuthenticated) {
      return (
        <>
          <div className="relative group min-w-40 flex justify-end">
            <button className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className="text-sm font-medium">{user?.name}</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <div className="absolute right-[-10] top-10 w-38 bg-white rounded-lg shadow-lg py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
              <Link
                href="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600"
              >
                Profile
              </Link>
              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                >
                  Admin Panel
                </Link>
              )}
              <hr className="my-2" />
              <button
                onClick={signOut}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      );
    }

    return (
      <div className="min-w-40 flex items-center justify-end space-x-4">
        <Link
          href="/sign-in"
          className="text-gray-700 hover:text-purple-600 transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Sign Up
        </Link>
      </div>
    );
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🛒</span>
            <span className="text-xl font-bold text-purple-600">E-Store</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-purple-600 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-purple-600 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/orders"
              className="text-gray-700 hover:text-purple-600 transition-colors"
            >
              My Orders
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/cart"
              className="relative text-gray-700 hover:text-purple-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {renderAuthSection()}
          </div>
        </div>
      </div>
    </nav>
  );
}
