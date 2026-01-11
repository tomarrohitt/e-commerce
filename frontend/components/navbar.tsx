import Link from "next/link";
import { AuthSection } from "./auth-section";
import { Suspense } from "react";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🛒</span>
            <span className="text-xl font-bold text-purple-600">E-Store</span>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            <Suspense fallback={<NavbarSkeleton />}>
              <AuthSection />
            </Suspense>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavbarSkeleton() {
  return (
    <div className="hidden md:flex items-center space-x-4">
      <nav className="hidden md:flex items-center space-x-12 mr-84">
        <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
        <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
        <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
      </nav>
      <div className="w-24 h-6 bg-gray-200 rounded animate-pulse" />
    </div>
  );
}
