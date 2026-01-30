"use client";

import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState, useRef, useEffect } from "react";

const links = [
  { name: "Home", href: "/" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "Orders", href: "/orders" },
  { name: "Profile", href: "/profile" },
  { name: "Address", href: "/addresses" },
];

export function NavLinks() {
  const pathname = usePathname();
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const containerRef = useRef<HTMLElement>(null);
  const [pillPosition, setPillPosition] = useState({ left: 0, width: 0 });
  const [activePillPosition, setActivePillPosition] = useState({
    left: 0,
    width: 0,
  });

  const activeLink = useMemo(() => {
    const exactMatch = links.find((link) => link.href === pathname);
    if (exactMatch) return exactMatch.href;

    const matchingLink = links
      .filter((link) => link.href !== "/" && pathname.startsWith(link.href))
      .sort((a, b) => b.href.length - a.href.length)[0];

    return matchingLink?.href || null;
  }, [pathname]);

  useEffect(() => {
    if (activeLink && containerRef.current) {
      const activeElement = containerRef.current.querySelector(
        `[href="${activeLink}"]`
      ) as HTMLAnchorElement;

      if (activeElement) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const activeRect = activeElement.getBoundingClientRect();

        setActivePillPosition({
          left: activeRect.left - containerRect.left,
          width: activeRect.width,
        });
      }
    }
  }, [activeLink]);

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    const target = e.currentTarget;
    const containerRect = containerRef.current?.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    if (containerRect) {
      if (hoveredLink === null && activeLink) {
        setPillPosition(activePillPosition);
      }

      setTimeout(() => {
        setPillPosition({
          left: targetRect.left - containerRect.left,
          width: targetRect.width,
        });
      }, 0);
    }
    setHoveredLink(href);
  };

  const handleMouseLeave = () => {
    setHoveredLink(null);
  };

  const showHoverPill = hoveredLink !== null;
  const shouldShowActivePill = !showHoverPill && activeLink;

  return (
    <nav ref={containerRef} className="relative flex gap-1">
      {links.map((link) => {
        const isActive = activeLink === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className="relative px-4 py-2 text-sm font-medium  transition-colors text-gray-700 hover:text-white"
            onMouseEnter={(e) => handleMouseEnter(e, link.href)}
            onMouseLeave={handleMouseLeave}
          >
            {link.name}
            {isActive && (
              <motion.span
                className="absolute inset-0 -z-10 rounded-full bg-gray-100"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </Link>
        );
      })}

      <AnimatePresence>
        {showHoverPill && (
          <motion.span
            className="absolute top-0 -z-10 h-full rounded-full bg-gray-500"
            initial={activePillPosition}
            animate={{
              opacity: 1,
              scale: 1,
              left: pillPosition.left,
              width: pillPosition.width,
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
          />
        )}
      </AnimatePresence>
    </nav>
  );
}
