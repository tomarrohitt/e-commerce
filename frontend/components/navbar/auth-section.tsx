import { CartCount } from "./cart-count";
import { UserDropdown } from "./user-dropdown";
import Link from "next/link";
import { AnimatedCart } from "./animated-cart";

import { NavLinks } from "./nav-links";
import { getUserFromSession } from "@/actions/session";

export async function AuthSection() {
  const user = await getUserFromSession();

  if (!user) {
    return <UnProtectedSection />;
  }

  return (
    <div className="flex justify-between items-center gap-6">
      <NavLinks />

      <div className="flex items-center gap-4 pl-6 border-l border-gray-200 ml-30">
        <UserDropdown user={user} />
        <AnimatedCart>
          <CartCount />
        </AnimatedCart>
      </div>
    </div>
  );
}

const UnProtectedSection = () => {
  return (
    <div className="flex items-center gap-4">
      <Link
        href="/sign-in"
        className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
      >
        Sign In
      </Link>
      <Link href="/sign-up">
        <button className="relative px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:bg-blue-500 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none">
          Sign Up
        </button>
      </Link>
    </div>
  );
};
