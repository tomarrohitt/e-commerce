"use client";

import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  ArrowRight,
  Mail,
} from "lucide-react";
import { motion } from "motion/react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { name: "New Arrivals" },
      { name: "Best Sellers" },
      { name: "Discount" },
      { name: "Categories" },
    ],
    company: [
      { name: "About Us" },
      { name: "Contact" },
      { name: "Careers" },
      { name: "Privacy Policy" },
    ],
    support: [
      { name: "FAQ" },
      { name: "Shipping" },
      { name: "Returns" },
      { name: "Order Status" },
    ],
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <footer className="bg-gray-950 text-gray-300 pt-20 pb-10 overflow-hidden relative">
      {/* Subtle Background Gradient Blob */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-900/10 rounded-full blur-3xl translate-y-1/4 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16"
        >
          {/* Brand Column */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white tracking-tight">
                E-Store
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Premium quality products for your lifestyle. Crafted with care and
              delivered with love to customers worldwide.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -3, color: "#60a5fa" }} // blue-400
                  className="p-2 bg-gray-900 rounded-full hover:bg-gray-800 transition-colors border border-gray-800"
                >
                  <Icon className="w-4 h-4" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Links Columns */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <FooterColumn
              title="Shop"
              links={footerLinks.shop}
              variants={itemVariants}
            />
            <FooterColumn
              title="Company"
              links={footerLinks.company}
              variants={itemVariants}
            />
            <FooterColumn
              title="Support"
              links={footerLinks.support}
              variants={itemVariants}
            />
          </div>

          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-white font-semibold">Stay in the loop</h3>
            <p className="text-sm text-gray-400">
              Subscribe to get special offers, free giveaways, and deals.
            </p>
            <form className="relative" onSubmit={(e) => e.preventDefault()}>
              <InputGroup className="max-w-xs">
                <InputGroupInput placeholder="Email Address" />
                <InputGroupAddon>
                  <Mail />
                </InputGroupAddon>
              </InputGroup>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-3 w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
              >
                Subscribe
              </motion.button>
            </form>
          </motion.div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500"
        >
          <p>© {currentYear} E-Store Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <div className="hover:text-gray-300 transition-colors">Terms</div>
            <div className="hover:text-gray-300 transition-colors">Privacy</div>
            <div className="hover:text-gray-300 transition-colors">Cookies</div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  variants,
}: {
  title: string;
  links: { name: string }[];
  variants: any;
}) {
  return (
    <motion.div variants={variants} className="space-y-6">
      <h3 className="text-white font-semibold">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.name}>
            <div className="group flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition-colors cursor-pointer">
              <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              <span className="group-hover:translate-x-1 transition-transform duration-300">
                {link.name}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
