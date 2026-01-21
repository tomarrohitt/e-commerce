"use client";
import { getImageUrl } from "@/lib/get-image-url";
import { User } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { LogoutButton } from "./logout-button";

type UserDropdownProps = {
  user: User;
};

export function UserDropdown({ user }: UserDropdownProps) {
  return (
    <div className="relative group min-w-40 flex justify-end">
      <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-500 transition-colors">
        {user.image ? (
          <Image
            src={getImageUrl(user.image)}
            alt={user?.name?.charAt(0).toUpperCase()}
            loading="eager"
            width={32}
            height={32}
            className="rounded-full"
            unoptimized
          />
        ) : (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
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
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-500"
        >
          Profile
        </Link>
        <hr className="my-2" />
        <LogoutButton />
      </div>
    </div>
  );
}
