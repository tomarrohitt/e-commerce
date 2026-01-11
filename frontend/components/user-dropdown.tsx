// components/user-dropdown.tsx
"use client";
import { User } from "@/types";
import Link from "next/link";

type UserDropdownProps = {
  user: User;
};

export function UserDropdown({ user }: UserDropdownProps) {
  return (
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
        <hr className="my-2" />
        <button
          // onClick={() => {}}
          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
