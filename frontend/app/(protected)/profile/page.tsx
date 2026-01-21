import {
  Mail,
  Calendar,
  Shield,
  X,
  Edit2,
  Save,
  Package,
  Heart,
  MapPin,
  CreditCard,
  AlertCircle,
  CheckCircle,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfilePicture } from "./profile-picture";
import { getUserFromSession } from "@/lib/user-auth";
import { getTotalOrdersSpend, getTotalOrdersCount } from "@/lib/api/orders";
import { getAddressCount } from "@/lib/api/addresses";

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
    wishlistItems: 8,
    savedAddresses: addressCount.count,
  };

  if (!user) return <div>Unauthorized</div>;
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <ProfilePicture user={user} />
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mt-4">
                    {user.name}
                  </h2>
                  <p className="text-gray-500 mt-1">{user.email}</p>

                  <Badge
                    variant="default"
                    className="mt-3 capitalize bg-blue-100 text-blue-700"
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    {user.role}
                  </Badge>
                  {user.emailVerified && (
                    <div className="mt-3 flex items-center space-x-1 text-green-500">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        Email Verified
                      </span>
                    </div>
                  )}

                  <Button variant="secondary" className="mt-6 w-full">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-bold text-gray-900">
                  Account Stats
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-500" />
                    </div>
                    <span className="font-semibold text-gray-900">Orders</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-500">
                    {stats.totalOrders}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-green-500" />
                    </div>
                    <span className="font-semibold text-gray-900">Spent</span>
                  </div>
                  <span className="text-2xl font-bold text-green-500">
                    ${stats.totalSpent}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Heart className="w-5 h-5 text-red-500" />
                    </div>
                    <span className="font-semibold text-gray-900">
                      Wishlist
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-red-500">
                    {stats.wishlistItems}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-500" />
                    </div>
                    <span className="font-semibold text-gray-900">
                      Addresses
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-blue-500">
                    {stats.savedAddresses}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-xl font-bold text-gray-900">
                  Account Information
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 text-gray-500 mb-1">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-semibold">User ID</span>
                    </div>
                    <p className="text-gray-900 font-mono text-sm break-all">
                      {user.id}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 text-gray-500 mb-1">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        Account Role
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium capitalize">
                      {user.role}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 text-gray-500 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        Member Since
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {user.createdAt}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 text-gray-500 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        Last Updated
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {user.updatedAt}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2 text-gray-500 mb-1">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm font-semibold">
                          Email Verification
                        </span>
                      </div>
                      <p className="text-gray-900 font-medium">
                        {user.emailVerified
                          ? "Your email is verified"
                          : "Email not verified"}
                      </p>
                    </div>
                    {user.emailVerified ? (
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    ) : (
                      <AlertCircle className="w-8 h-8 text-yellow-500" />
                    )}
                  </div>
                  {!user.emailVerified && (
                    <Button variant="secondary" size="sm" className="mt-3">
                      Verify Email
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <h3 className="text-xl font-bold text-gray-900">
                  Security & Privacy
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">
                        Change Password
                      </p>
                      <p className="text-sm text-gray-500">
                        Update your password regularly
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>

                <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">
                        Two-Factor Authentication
                      </p>
                      <p className="text-sm text-gray-500">
                        Add an extra layer of security
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>

                <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">
                        Privacy Settings
                      </p>
                      <p className="text-sm text-gray-500">
                        Manage your data and privacy
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>
              </CardContent>
            </Card>
            <Card className="border-red-200">
              <CardHeader>
                <h3 className="text-xl font-bold text-red-500">Danger Zone</h3>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 mb-4">
                    Once you delete your account, there is no going back. Please
                    be certain.
                  </p>
                  <Button variant="destructive" size="sm">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
