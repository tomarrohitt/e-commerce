import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-white text-xl">MarketPlace</h3>
            <p className="text-sm text-gray-400">
              Your trusted destination for everything you need.
            </p>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <h4 className="text-white text-sm">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a className="hover:text-blue-400 transition-colors">
                  All Products
                </a>
              </li>
              <li>
                <a className="hover:text-blue-400 transition-colors">
                  Categories
                </a>
              </li>
              <li>
                <a className="hover:text-blue-400 transition-colors">
                  Best Sellers
                </a>
              </li>
              <li>
                <a className="hover:text-blue-400 transition-colors">
                  New Arrivals
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-white text-sm">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a className="hover:text-blue-400 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a className="hover:text-blue-400 transition-colors">
                  Shipping Info
                </a>
              </li>
              <li>
                <a className="hover:text-blue-400 transition-colors">Returns</a>
              </li>
              <li>
                <a className="hover:text-blue-400 transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="text-white text-sm">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a className="hover:text-blue-400 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a className="hover:text-blue-400 transition-colors">Careers</a>
              </li>
              <li>
                <a className="hover:text-blue-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a className="hover:text-blue-400 transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © 2026 MarketPlace. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex gap-4">
            <a
              className="w-10 h-10 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              className="w-10 h-10 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              className="w-10 h-10 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              className="w-10 h-10 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
              aria-label="YouTube"
            >
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
