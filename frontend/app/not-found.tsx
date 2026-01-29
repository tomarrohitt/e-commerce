import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Home,
  ShoppingBag,
  Sparkles,
  Flame,
  DollarSign,
  MessageCircle,
} from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center p-5 relative overflow-hidden">
      {/* Animated background decorations */}
      <div className="absolute w-75 h-75 bg-blue-600 rounded-full opacity-10 -top-24 -left-24 animate-pulse" />
      <div className="absolute w-50 h-50 bg-blue-500 rounded-full opacity-10 -bottom-12 -right-12 animate-pulse delay-1000" />
      <div className="absolute w-37.5 h-37.5 bg-blue-400 rounded-full opacity-10 top-1/2 right-[10%] animate-pulse delay-2000" />

      <div className="max-w-3xl w-full text-center relative z-10">
        {/* 404 Error Code */}
        <div className="relative inline-block mb-6">
          <h1 className="text-[clamp(120px,20vw,220px)] font-extrabold leading-none bg-linear-to-br from-blue-600 to-blue-400 bg-clip-text text-transparent">
            404
          </h1>
        </div>

        {/* Heading and Description */}
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Oops! Page Not Found
        </h2>
        <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
          The page you&apos;re looking for seems to have wandered off.
          Don&apos;t worry, even the best shoppers take a wrong turn sometimes!
        </p>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center flex-wrap mb-16">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Back to Home
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <Link href="/shop">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Continue Shopping
            </Link>
          </Button>
        </div>

        {/* Suggestion Box */}
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Popular Destinations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/shop/new-arrivals"
                className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-all duration-300 group"
              >
                <Sparkles className="h-5 w-5 shrink-0" />
                <span className="font-medium">New Arrivals</span>
              </Link>
              <Link
                href="/shop/best-sellers"
                className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-all duration-300 group"
              >
                <Flame className="h-5 w-5 shrink-0" />
                <span className="font-medium">Best Sellers</span>
              </Link>
              <Link
                href="/shop/deals"
                className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-all duration-300 group"
              >
                <DollarSign className="h-5 w-5 shrink-0" />
                <span className="font-medium">Today&apos;s Deals</span>
              </Link>
              <Link
                href="/support"
                className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-all duration-300 group"
              >
                <MessageCircle className="h-5 w-5 shrink-0" />
                <span className="font-medium">Help Center</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
