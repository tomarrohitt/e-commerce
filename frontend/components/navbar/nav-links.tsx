"use client";

import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const links = [
  { name: "Home", href: "/" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "Orders", href: "/orders" },
  { name: "Profile", href: "/profile" },
  { name: "Address", href: "/addresses" },
];

export function NavLinks() {
  const pathname = usePathname();

  const activeLink = useMemo(() => {
    const exactMatch = links.find((link) => link.href === pathname);
    if (exactMatch) return exactMatch.href;
    const matchingLink = links
      .filter((link) => link.href !== "/" && pathname.startsWith(link.href))
      .sort((a, b) => b.href.length - a.href.length)[0];

    return matchingLink?.href || null;
  }, [pathname]);

  return (
    <nav className="hidden md:flex items-center gap-2 flex-1">
      {links.map((link) => {
        const isActive = activeLink === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className="relative px-4 py-2 text-sm font-medium duration-200 text-white transition hover:text-gray-300"
          >
            <span className="z-10 relative mix-blend-exclusion">
              {link.name}
            </span>
            <AnimatePresence>
              {isActive && (
                <motion.div
                  className="absolute bg-gray-800 inset-0"
                  layoutId="indicator"
                  initial={false}
                  style={{
                    borderRadius: 9999,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 30,
                  }}
                />
              )}
            </AnimatePresence>
          </Link>
        );
      })}
    </nav>
  );
}
