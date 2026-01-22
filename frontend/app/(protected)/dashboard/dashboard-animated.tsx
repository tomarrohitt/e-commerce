"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { User } from "@/types";

interface DashboardClientProps {
  user: User;
  stats: Array<{
    title: string;
    value: number;
    icon: string;
    href: string;
  }>;
}

/* -------------------------------------------------------------------------- */
/* Motion                                   */
/* -------------------------------------------------------------------------- */

const container: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

/* -------------------------------------------------------------------------- */

export default function DashboardClient({ user, stats }: DashboardClientProps) {
  return (
    // MATCHED: Outer container padding and max-width from Loader
    <motion.div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {/* MATCHED: Blue Gradient Header Block */}
      <motion.div
        variants={fadeUp}
        className="bg-linear-to-r from-blue-500 to-indigo-700 rounded-2xl p-8 text-white mb-8 shadow-lg"
      >
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-blue-100 opacity-90">
          Here&apos;s what&apos;s happening with your account today.
        </p>
      </motion.div>

      {/* MATCHED: Stats Grid Layout */}
      <motion.div
        variants={container}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={fadeUp}>
            <Link href={stat.href} className="block h-full">
              {/* MATCHED: Individual Stat Card Styling (Shadow-md, Rounded-xl) */}
              <div className="bg-white rounded-xl shadow-md p-6 h-full hover:shadow-lg transition-shadow border border-transparent hover:border-blue-100">
                {/* MATCHED: Flex Layout (Icon left, Value right) */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-2xl">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                </div>
                {/* MATCHED: Label at bottom */}
                <div className="text-sm font-medium text-gray-500">
                  {stat.title}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* MATCHED: Quick Actions Container */}
      <motion.div
        variants={fadeUp}
        className="bg-white rounded-xl shadow-md p-6 mb-8"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: "🛍️",
              title: "Browse Products",
              description: "Discover items",
              href: "/products",
            },
            {
              icon: "📦",
              title: "View Orders",
              description: "Track purchases",
              href: "/orders",
            },
            {
              icon: "⚙️",
              title: "Profile",
              description: "Manage account",
              href: "/profile",
            },
          ].map((action) => (
            <Link key={action.title} href={action.href}>
              {/* MATCHED: Action Item Styling (Border-2, Flex Row) */}
              <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50/50 transition-colors cursor-pointer">
                <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-lg shrink-0 text-xl">
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">
                    {action.title}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {action.description}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* MATCHED: Account Info Container */}
      <motion.div
        variants={fadeUp}
        className="bg-white rounded-xl shadow-md p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Account Information
        </h2>

        <div className="space-y-0">
          {[
            { label: "Email", value: user?.email },
            { label: "Name", value: user?.name },
            { label: "Role", value: user?.role },
            {
              label: "Status",
              value: user?.emailVerified ? "Verified" : "Unverified",
            },
            {
              label: "Member Since",
              value: user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })
                : "N/A",
            },
          ].map((row, i) => (
            <div
              key={row.label}
              className={`flex justify-between items-center py-3 ${
                i !== 4 ? "border-b border-gray-100" : ""
              }`}
            >
              <span className="text-sm font-medium text-gray-500">
                {row.label}
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
