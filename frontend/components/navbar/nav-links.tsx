"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { name: "Home", href: "/" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "Orders", href: "/orders" },
  { name: "Profile", href: "/profile" },
  { name: "Address", href: "/addresses" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-2 flex-1">
      {links.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className="relative px-4 py-2 text-sm font-medium duration-200 text-white transition"
          >
            <span className="z-10 relative mix-blend-exclusion">
              {link.name}
            </span>
            {isActive && (
              <motion.div
                className="absolute bg-gray-800 inset-0"
                layoutId="indicator"
                style={{
                  borderRadius: 9999,
                }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
