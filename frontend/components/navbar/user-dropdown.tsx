"use client";
import { getImageUrl } from "@/lib/constants/get-image-url";
import { User } from "@/types";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { LogoutButton } from "./logout-button";
import { ChevronDown } from "lucide-react";

type UserDropdownProps = {
  user: User;
};

export function UserDropdown({ user }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const imgUrl = getImageUrl(user.image);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="flex items-center gap-2 focus:outline-none group py-2">
        {user.image ? (
          <motion.div whileHover={{ scale: 1.1 }}>
            <Image
              src={imgUrl}
              alt=""
              width={36}
              height={36}
              className="rounded-full border-2 border-white shadow-sm"
              unoptimized={true}
            />
          </motion.div>
        ) : (
          <div className="w-9 h-9 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
            {user.name?.charAt(0).toUpperCase() || "U"}
          </div>
        )}

        <div className="hidden lg:flex flex-col items-start">
          <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
            {user.name}
          </span>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute right-0 top-full pt-2 w-56 z-50"
          >
            <div className="bg-white/80 shadow-xl border border-white/20 overflow-hidden ring-1 ring-black/5 p-1">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>

              <div className="border-t border-gray-100 p-1">
                <LogoutButton />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
