import {
  Mail,
  Calendar,
  Shield,
  Edit2,
  Package,
  Heart,
  MapPin,
  CreditCard,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfilePicture } from "./profile-picture";
import { getUserFromSession } from "@/actions/session";
import {
  getTotalOrdersSpend,
  getTotalOrdersCount,
} from "@/lib/services/orders";
import { getAddressCount } from "@/lib/services/addresses";
import Link from "next/link";
import { entranceAnim } from "@/lib/constants/enter-animation";

export default async function ProfilePage() {
  const [user, totalSpend, ordersCount, addressCount] = await Promise.all([
    getUserFromSession(),
    getTotalOrdersSpend(),
    getTotalOrdersCount(),
    getAddressCount(),
  ]);

  const stats = {
    totalOrders: ordersCount.total,
    totalSpent: totalSpend.total,
    wishlistItems: 0,
    savedAddresses: addressCount.count,
  };

  if (!user) return <div>Unauthorized</div>;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header Section - No delay */}
        <div className={`mb-8 lg:mb-12 ${entranceAnim}`}>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            My Profile
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Sidebar - Profile Card - Delay 100ms */}
          <div className={`lg:col-span-4 space-y-6 ${entranceAnim} delay-100`}>
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur transition-all duration-300 hover:shadow-xl hover:bg-white/90">
              <CardContent className="pt-8 pb-8">
                <div className="flex flex-col items-center group/profile">
                  <div className="relative transition-transform duration-500 hover:scale-105">
                    <ProfilePicture user={user} />
                    <div className="absolute inset-0 rounded-full ring-2 ring-white/50 opacity-0 group-hover/profile:opacity-100 transition-opacity duration-500 animate-pulse" />
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mt-6">
                    {user.name}
                  </h2>
                  <p className="text-gray-600 mt-1.5 text-sm">{user.email}</p>

                  <div className="flex items-center gap-3 mt-4">
                    <Badge
                      variant="default"
                      className="capitalize bg-linear-to-r from-blue-500 to-indigo-500 text-white border-0 px-3 py-1 shadow-sm"
                    >
                      <Shield className="w-3.5 h-3.5 mr-1.5" />
                      {user.role}
                    </Badge>
                    {user.emailVerified && (
                      <Badge
                        variant="default"
                        className="bg-linear-to-r from-green-500 to-emerald-500 text-white border-0 px-3 py-1 shadow-sm"
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid - Delay 200ms */}
            <Card
              className={`border-0 shadow-lg bg-white/80 backdrop-blur ${entranceAnim} delay-200`}
            >
              <CardHeader className="pb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Account Overview
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Stat Item 1 */}
                <div className="group p-4 bg-linear-to-br from-blue-50 to-blue-100/50 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer border border-blue-100 hover:border-blue-200 hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 ease-out">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 font-medium">
                          Total Orders
                        </span>
                        <p className="text-2xl font-bold text-blue-600 mt-0.5">
                          {stats.totalOrders}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                </div>

                {/* Stat Item 2 */}
                <div className="group p-4 bg-linear-to-br from-green-50 to-green-100/50 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer border border-green-100 hover:border-green-200 hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 ease-out">
                        <CreditCard className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 font-medium">
                          Total Spent
                        </span>
                        <p className="text-2xl font-bold text-green-600 mt-0.5">
                          ${stats.totalSpent}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                </div>

                {/* Stat Item 3 */}
                <div className="group p-4 bg-linear-to-br from-pink-50 to-pink-100/50 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer border border-pink-100 hover:border-pink-200 hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 ease-out">
                        <Heart className="w-5 h-5 text-pink-600" />
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 font-medium">
                          Wishlist
                        </span>
                        <p className="text-2xl font-bold text-pink-600 mt-0.5">
                          {stats.wishlistItems}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                </div>

                {/* Stat Item 4 */}
                <div className="group p-4 bg-linear-to-br from-purple-50 to-purple-100/50 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer border border-purple-100 hover:border-purple-200 hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 ease-out">
                        <MapPin className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 font-medium">
                          Addresses
                        </span>
                        <p className="text-2xl font-bold text-purple-600 mt-0.5">
                          {stats.savedAddresses}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8 space-y-6">
            {/* Main Info Card - Delay 300ms */}
            <Card
              className={`border-0 shadow-lg bg-white/80 backdrop-blur ${entranceAnim} delay-300`}
            >
              <CardHeader className="border-b border-gray-100 pb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Account Information
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Your account details and membership information
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Info Blocks with hover lift */}
                  {[
                    {
                      icon: Shield,
                      label: "User ID",
                      value: user.id.toUpperCase(),
                      mono: true,
                    },
                    {
                      icon: Shield,
                      label: "Account Role",
                      value: user.role,
                      capitalize: true,
                    },
                    {
                      icon: Calendar,
                      label: "Member Since",
                      value: new Date(user.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        },
                      ),
                    },
                    {
                      icon: Calendar,
                      label: "Last Updated",
                      value: new Date(user?.updatedAt!).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        },
                      ),
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="p-5 bg-linear-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-sm hover:border-blue-200 hover:bg-blue-50/30"
                    >
                      <div className="flex items-center space-x-2 text-gray-600 mb-2">
                        <item.icon className="w-4 h-4" />
                        <span className="text-xs font-semibold uppercase tracking-wide">
                          {item.label}
                        </span>
                      </div>
                      <p
                        className={`text-gray-900 ${item.mono ? "font-mono text-sm break-all font-bold" : "font-medium"} ${item.capitalize ? "capitalize text-lg font-semibold" : ""}`}
                        style={item.mono ? { fontFamily: "sans-serif" } : {}}
                      >
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div
                  className={`p-5 rounded-xl border-2 transition-all duration-300 hover:shadow-md ${
                    user.emailVerified
                      ? "bg-linear-to-br from-green-50 to-emerald-50/50 border-green-200 hover:border-green-300"
                      : "bg-linear-to-br from-yellow-50 to-amber-50/50 border-yellow-200 hover:border-yellow-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 hover:scale-110 ${
                          user.emailVerified ? "bg-green-100" : "bg-yellow-100"
                        }`}
                      >
                        {user.emailVerified ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <AlertCircle className="w-6 h-6 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Mail className="w-4 h-4 text-gray-600" />
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                            Email Verification
                          </span>
                        </div>
                        <p
                          className={`font-semibold text-lg ${
                            user.emailVerified
                              ? "text-green-700"
                              : "text-yellow-700"
                          }`}
                        >
                          {user.emailVerified
                            ? "Your email is verified"
                            : "Email not verified"}
                        </p>
                      </div>
                    </div>
                  </div>
                  {!user.emailVerified && (
                    <Button
                      variant="default"
                      size="sm"
                      className="mt-4 bg-linear-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white border-0 transition-transform active:scale-95"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Verify Email Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Security Card - Delay 400ms */}
            <Card
              className={`border-0 shadow-lg bg-white/80 backdrop-blur ${entranceAnim} delay-400`}
            >
              <CardHeader className="border-b border-gray-100 pb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Security & Privacy
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Manage your security settings and preferences
                </p>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <Link href="/profile/change/password">
                  <button className="w-full group flex items-center justify-between p-5 bg-linear-to-r from-gray-50 to-gray-100/50 rounded-xl hover:shadow-md transition-all duration-300 border border-gray-200 hover:border-blue-300 hover:-translate-y-0.5">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                        <Lock className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 text-base group-hover:text-blue-600 transition-colors">
                          Change Password
                        </p>
                        <p className="text-sm text-gray-600 mt-0.5">
                          Update your password regularly for better security
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" />
                  </button>
                </Link>

                <Link href="/profile/change/email">
                  <button className="w-full group flex items-center justify-between p-5 bg-linear-to-r from-gray-50 to-gray-100/50 rounded-xl hover:shadow-md transition-all duration-300 border border-gray-200 hover:border-purple-300 hover:-translate-y-0.5">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 text-base group-hover:text-purple-600 transition-colors">
                          Change Email
                        </p>
                        <p className="text-sm text-gray-600 mt-0.5">
                          Keep this up to date to ensure account recovery.
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all duration-300" />
                  </button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
