// app/products/[id]/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star,
  Heart,
  Share2,
  ShoppingCart,
  Check,
  Truck,
  Shield,
  RefreshCw,
} from "lucide-react";

// Dummy product data matching your API structure
const DUMMY_PRODUCT = {
  id: "cmj2igay400015wi5l8f80ixd",
  name: "Modern Web Architecture",
  description:
    "A detailed exploration of scalable frontend and backend design patterns for high-traffic applications. This comprehensive guide covers microservices, serverless architectures, and modern deployment strategies.",
  price: "1499",
  stockQuantity: 1975,
  sku: "SKU123TEST987",
  images: [
    "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800",
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800",
    "https://images.unsplash.com/photo-1589998059171-988d887df646?w=800",
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800",
    "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800",
    "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800",
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800",
    "https://images.unsplash.com/photo-1589998059171-988d887df646?w=800",
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800",
    "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800",
  ],
  thumbnail:
    "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400",
  isActive: true,
  createdAt: "2025-12-12T06:53:20.620Z",
  updatedAt: "2025-12-13T15:02:04.996Z",
  categoryId: "cmj2hu36p00063ai59pom9k5u",
  category: {
    id: "cmj2hu36p00063ai59pom9k5u",
    name: "Books",
    slug: "books",
    createdAt: "2025-12-12T06:36:04.128Z",
    updatedAt: "2025-12-12T06:36:04.128Z",
  },
  // Extended fields for better UI
  rating: 4.8,
  reviewCount: 342,
  author: "Sarah Johnson & Michael Chen",
  publisher: "Tech Press International",
  publishedDate: "2024",
  pages: 456,
  language: "English",
  isbn: "978-1-234567-89-0",

  specifications: {
    Format: "Hardcover",
    Dimensions: "9.2 x 7.5 x 1.8 inches",
    Weight: "2.4 lbs",
    Edition: "1st Edition",
    Language: "English",
    "ISBN-10": "1234567890",
    "ISBN-13": "978-1-234567-89-0",
  },
};

const DUMMY_REVIEWS = [
  {
    id: 1,
    author: "John Doe",
    rating: 5,
    date: "2024-12-01",
    title: "Outstanding resource for modern developers",
    content:
      "This book has completely transformed how I approach web architecture. The real-world examples are invaluable, and the explanations are crystal clear. Highly recommended for any serious developer.",
    helpful: 45,
  },
  {
    id: 2,
    author: "Emily Chen",
    rating: 5,
    date: "2024-11-28",
    title: "Best architecture book I've read",
    content:
      "Comprehensive, well-structured, and practical. The case studies really help cement the concepts. Worth every penny!",
    helpful: 32,
  },
  {
    id: 3,
    author: "Michael Brown",
    rating: 4,
    date: "2024-11-15",
    title: "Great content, slightly technical",
    content:
      "Excellent material but assumes some prior knowledge. Perfect for intermediate to advanced developers.",
    helpful: 18,
  },
];

export default function ProductDetailPage() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "description" | "specifications" | "reviews"
  >("description");
  const [isWishlisted, setIsWishlisted] = useState(false);

  const product = DUMMY_PRODUCT;
  const maxQuantity = Math.min(10, product.stockQuantity);

  const handleQuantityChange = (value: number) => {
    if (value >= 1 && value <= maxQuantity) {
      setQuantity(value);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-linear-to-br from-purple-50 to-indigo-50 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-5 gap-3">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? "border-purple-600 shadow-md scale-105"
                      : "border-gray-200 hover:border-purple-400"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6 mt-10">
            {/* Category Badge */}
            <Link
              href={`/products?category=${product.category.slug}`}
              className="inline-block bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-purple-200 transition-colors"
            >
              {product.category.name}
            </Link>

            {/* Product Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>

            {/* Author */}
            <p className="text-lg text-gray-600">
              by{" "}
              <span className="font-semibold text-gray-900">
                {product.author}
              </span>
            </p>

            {/* Rating */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {product.rating}
              </span>
              <span className="text-gray-500">
                ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline space-x-4">
              <span className="text-4xl font-bold text-purple-600">
                ${(parseFloat(product.price) / 100).toFixed(2)}
              </span>
              <span className="text-lg text-gray-500 line-through">$19.99</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                25% OFF
              </span>
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              {product.stockQuantity > 0 ? (
                <>
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-green-600 font-semibold">
                    In Stock ({product.stockQuantity} available)
                  </span>
                </>
              ) : (
                <span className="text-red-600 font-semibold">Out of Stock</span>
              )}
            </div>

            {/* Features */}

            {/* Quantity Selector */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">
                Quantity
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="w-12 h-12 rounded-lg border-2 border-gray-300 hover:border-purple-600 hover:bg-purple-50 transition-all flex items-center justify-center font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max={maxQuantity}
                  value={quantity}
                  onChange={(e) =>
                    handleQuantityChange(parseInt(e.target.value) || 1)
                  }
                  className="w-20 h-12 text-center border-2 border-gray-300 rounded-lg font-semibold text-lg focus:border-purple-600 focus:outline-none"
                />
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= maxQuantity}
                  className="w-12 h-12 rounded-lg border-2 border-gray-300 hover:border-purple-600 hover:bg-purple-50 transition-all flex items-center justify-center font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
                <span className="text-sm text-gray-500">
                  Max: {maxQuantity}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 shadow-lg">
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Cart</span>
              </button>
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg">
                Buy Now
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 border-2 ${
                    isWishlisted
                      ? "bg-red-50 border-red-300 text-red-700"
                      : "bg-white border-gray-300 text-gray-700 hover:border-purple-400"
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${isWishlisted ? "fill-red-600" : ""}`}
                  />
                  <span>Wishlist</span>
                </button>
                <button className="py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 bg-white border-2 border-gray-300 text-gray-700 hover:border-purple-400">
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Truck className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-xs font-semibold text-gray-700">
                  Free Shipping
                </span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-xs font-semibold text-gray-700">
                  Secure Payment
                </span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs font-semibold text-gray-700">
                  30-Day Returns
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-16">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: "description", label: "Description" },
                { id: "specifications", label: "Specifications" },
                { id: "reviews", label: `Reviews (${product.reviewCount})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-purple-600 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="py-8">
            {/* Description Tab */}
            {activeTab === "description" && (
              <div className="max-w-4xl space-y-6 animate-fadeIn">
                <div className="bg-white rounded-xl p-8 shadow-sm">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    About This Book
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {product.description}
                  </p>

                  <h3 className="text-xl font-bold text-gray-900 mb-4 mt-8">
                    What You'll Learn
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Master microservices architecture patterns",
                      "Build scalable serverless applications",
                      "Implement effective caching strategies",
                      "Design fault-tolerant distributed systems",
                      "Optimize performance for high-traffic scenarios",
                    ].map((item, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 p-6 bg-linear-to-r from-purple-50 to-indigo-50 rounded-xl">
                    <h4 className="font-bold text-gray-900 mb-2">Publisher</h4>
                    <p className="text-gray-700">{product.publisher}</p>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <span className="text-sm text-gray-600">Published</span>
                        <p className="font-semibold text-gray-900">
                          {product.publishedDate}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Pages</span>
                        <p className="font-semibold text-gray-900">
                          {product.pages}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === "specifications" && (
              <div className="max-w-4xl animate-fadeIn">
                <div className="bg-white rounded-xl p-8 shadow-sm">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Product Specifications
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between py-3 border-b border-gray-100"
                        >
                          <span className="font-semibold text-gray-900">
                            {key}:
                          </span>
                          <span className="text-gray-700">{value}</span>
                        </div>
                      ),
                    )}
                  </div>

                  <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                    <h3 className="font-bold text-gray-900 mb-2">SKU</h3>
                    <p className="font-mono text-gray-700">{product.sku}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="max-w-4xl space-y-6 animate-fadeIn">
                {/* Rating Summary */}
                <div className="bg-white rounded-xl p-8 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-12">
                    <div className="text-center mb-6 md:mb-0">
                      <div className="text-6xl font-bold text-gray-900">
                        {product.rating}
                      </div>
                      <div className="flex items-center justify-center space-x-1 mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-6 h-6 ${
                              i < Math.floor(product.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-600 mt-2">
                        {product.reviewCount} reviews
                      </p>
                    </div>

                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div
                          key={rating}
                          className="flex items-center space-x-3"
                        >
                          <span className="text-sm font-semibold text-gray-700 w-12">
                            {rating} star
                          </span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{
                                width: `${rating === 5 ? 70 : rating === 4 ? 20 : 5}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">
                            {rating === 5 ? "70%" : rating === 4 ? "20%" : "5%"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Individual Reviews */}
                {DUMMY_REVIEWS.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white rounded-xl p-8 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900">
                          {review.author}
                        </h4>
                        <div className="flex items-center space-x-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {review.date}
                      </span>
                    </div>
                    <h5 className="font-semibold text-gray-900 mb-2">
                      {review.title}
                    </h5>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {review.content}
                    </p>
                    <button className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
                      Helpful ({review.helpful})
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
