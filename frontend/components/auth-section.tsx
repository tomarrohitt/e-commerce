import Link from "next/link";
import { UserDropdown } from "./user-dropdown";
import { CartCount } from "./cart-count";
import { getUserFromSession } from "@/lib/user-auth";
import { ShoppingCart } from "lucide-react";

export async function AuthSection() {
  const user = await getUserFromSession();
  if (!user) {
    return <UnProtectedSection />;
  }

  return (
    <>
      <nav className="hidden md:flex items-center space-x-12 mr-60">
        <Link
          href="/"
          className="text-gray-700 hover:text-blue-500 transition-all duration-200 font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-blue-500 after:transition-all after:duration-200 hover:after:w-full"
        >
          Home
        </Link>
        <Link
          href="/dashboard"
          className="text-gray-700 hover:text-blue-500 transition-all duration-200 font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-blue-500 after:transition-all after:duration-200 hover:after:w-full"
        >
          Dashboard
        </Link>
        <Link
          href="/orders"
          className="text-gray-700 hover:text-blue-500 transition-all duration-200 font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-blue-500 after:transition-all after:duration-200 hover:after:w-full"
        >
          Orders
        </Link>
      </nav>

      <Link
        href="/cart"
        className="relative text-gray-700 hover:text-blue-500 transition-all duration-200 hover:scale-110 active:scale-95"
        aria-label="Shopping cart"
      >
        <ShoppingCart className="w-6 h-6" />
        <CartCount />
      </Link>

      <UserDropdown user={user} />
    </>
  );
}

const UnProtectedSection = () => {
  return (
    <div className="min-w-40 flex items-center justify-end space-x-8 mr-5">
      <Link
        href="/sign-in"
        className="text-gray-700 hover:text-blue-500 transition-all duration-200 font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-blue-500 after:transition-all after:duration-200 hover:after:w-full"
      >
        Sign In
      </Link>
      <Link
        href="/sign-up"
        className="bg-blue-500 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
      >
        Sign Up
      </Link>
    </div>
  );
};
