import Link from "next/link";
import { getOrder } from "@/lib/api/orders";
import {
  CheckCircle,
  MapPin,
  ArrowRight,
  Home,
  ShoppingBag,
  Package,
  Calendar,
  CreditCard,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

interface OrderDetailsPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function OrderSuccessPage({
  params,
}: OrderDetailsPageProps) {
  const { orderId } = await params;

  // --- Error State: Missing ID ---
  if (!orderId) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-lg border-red-100">
          <CardHeader>
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <CardTitle>Missing Order ID</CardTitle>
            <CardDescription>No order information found.</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild>
              <Link href="/">Return Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const order = await getOrder(orderId);

  // --- Error State: Not Found ---
  if (!order) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-lg border-red-100">
          <CardHeader>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <CardTitle>Order Not Found</CardTitle>
            <CardDescription>
              We couldn&apos;t retrieve this order.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild variant="destructive">
              <Link href="/">Return Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Formatters
  const isPaid = order.status === "PAID";
  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-linear-to-br from-green-400 to-emerald-600 rounded-full shadow-xl shadow-green-200">
            <CheckCircle className="w-12 h-12 text-white" strokeWidth={3} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Order Confirmed!
          </h1>
          <p className="text-lg text-slate-600 max-w-md mx-auto">
            Thank you for your purchase. We&apos;ve received your order and are
            getting it ready.
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Order Items (Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-md border-slate-100 overflow-hidden pt-0">
              <CardHeader className="bg-slate-50/50 pb-4 border-b pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-blue-600" />
                      Order Summary
                    </CardTitle>
                    <CardDescription>
                      {order.items.length} items in your order
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    #{order.id.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {order.items.map((item) => (
                    <div key={item.productId} className="flex gap-4">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border bg-slate-100 shrink-0">
                        <Image
                          src={item.thumbnail}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                        <div>
                          <h4 className="font-semibold text-slate-900 truncate">
                            {item.name}
                          </h4>
                          <p className="text-sm text-slate-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium text-slate-900">
                          ${item.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-slate-700">
                    Total Amount
                  </span>
                  <span className="text-2xl font-bold text-slate-900">
                    ${order.totalAmount}{" "}
                    <span className="text-sm font-normal text-slate-500">
                      {order.currency}
                    </span>
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons (Desktop) */}
            <div className="hidden lg:flex gap-4">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 h-12"
                asChild
              >
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <Button
                size="lg"
                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
                asChild
              >
                <Link href="/products">
                  Continue Shopping
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar Details (Span 1) */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="shadow-sm border-slate-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium text-slate-500">
                  Payment Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 px-3 py-1 text-sm border-0 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                    Payment Confirmed
                  </Badge>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="w-4 h-4" />
                  {formattedDate}
                </div>
              </CardContent>
            </Card>

            {/* Address Card */}
            <Card className="shadow-sm border-slate-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 leading-relaxed">
                <p className="font-medium text-slate-900 mb-1">
                  Delivery Address
                </p>
                {order.shippingAddress.street}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.zipCode}
                <br />
                {order.shippingAddress.country}
                <br />
                <span className="block mt-2 text-slate-400">
                  {order.shippingAddress.phoneNumber}
                </span>
              </CardContent>
            </Card>

            {/* What's Next (Colored Card) */}
            <Card className="bg-blue-600 text-white border-0 shadow-lg shadow-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">What happens next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shrink-0 text-xs font-bold border border-blue-400">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-sm">Processing</p>
                    <p className="text-xs text-blue-100 mt-0.5">
                      We are preparing your order.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shrink-0 text-xs font-bold border border-blue-400">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-sm">Shipped</p>
                    <p className="text-xs text-blue-100 mt-0.5">
                      Tracking email incoming.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shrink-0 text-xs font-bold border border-blue-400">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-sm">Delivery</p>
                    <p className="text-xs text-blue-100 mt-0.5">
                      Est. 3-5 business days.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons (Mobile Only) */}
            <div className="flex flex-col gap-3 lg:hidden">
              <Button size="lg" className="w-full bg-blue-600" asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full" asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </div>

            <div className="text-center pt-2">
              <Link
                href="/support"
                className="text-sm text-muted-foreground hover:text-blue-600 hover:underline"
              >
                Need help? Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
