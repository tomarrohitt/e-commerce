import Link from "next/link";
import { AuthSection } from "./auth-section";
import { getUserFromSession } from "@/actions/session";
export default async function Navbar() {
  const user = await getUserFromSession();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex flex-1 items-center space-x-2">
            <span className="text-2xl">🛒</span>
            <span className="text-xl font-bold text-blue-500">E-Store</span>
          </Link>

          <div className="flex items-center justify-end space-x-4 flex-2">
            <AuthSection user={user} />
          </div>
        </div>
      </div>
    </nav>
  );
}
