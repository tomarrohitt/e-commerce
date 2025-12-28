// app/(protected)/profile/page.tsx
"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Camera,
  Check,
  X,
  Edit2,
  Save,
  Package,
  Heart,
  MapPin,
  CreditCard,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

const DUMMY_USER = {
  id: "vaJuwrf0lUP9LCQyE73rxQyOBEYUohxp",
  name: "Yexila",
  email: "yexila1062@asurad.com",
  emailVerified: true,
  image: "isdoasdosiodas",
  createdAt: "2025-12-12T14:44:52.352Z",
  updatedAt: "2025-12-12T14:45:32.924Z",
  role: "user",
};

const USER_STATS = {
  totalOrders: 12,
  totalSpent: 3456.78,
  wishlistItems: 8,
  savedAddresses: 3,
};

export default function ProfilePage() {
  const [user, setUser] = useState(DUMMY_USER);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(user.image);

  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    image: user.image,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      if (!formData.name.trim()) {
        toast.error("Name cannot be empty");
        setIsSaving(false);
        return;
      }

      if (!formData.email.trim()) {
        toast.error("Email cannot be empty");
        setIsSaving(false);
        return;
      }

      // TODO: Call your API endpoint here
      // await updateProfile(formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setUser({
        ...user,
        name: formData.name,
        email: formData.email,
        image: formData.image,
        updatedAt: new Date().toISOString(),
      });

      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      image: user.image,
    });
    setImagePreview(user.image);
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-linear-to-br from-purple-400 to-indigo-600 flex items-center justify-center shadow-xl">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt={formData.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-4xl font-bold">
                          {getInitials(formData.name)}
                        </span>
                      )}
                    </div>

                    {isEditing && (
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-colors"
                      >
                        <Camera className="w-5 h-5 text-white" />
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mt-4">
                    {user.name}
                  </h2>
                  <p className="text-gray-600 mt-1">{user.email}</p>

                  <Badge
                    variant="default"
                    className="mt-3 capitalize bg-purple-100 text-purple-700"
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    {user.role}
                  </Badge>
                  {user.emailVerified && (
                    <div className="mt-3 flex items-center space-x-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        Email Verified
                      </span>
                    </div>
                  )}

                  {!isEditing && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="secondary"
                      className="mt-6 w-full"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
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
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="font-semibold text-gray-900">Orders</span>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">
                    {USER_STATS.totalOrders}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="font-semibold text-gray-900">Spent</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    ${USER_STATS.totalSpent.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Heart className="w-5 h-5 text-red-600" />
                    </div>
                    <span className="font-semibold text-gray-900">
                      Wishlist
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">
                    {USER_STATS.wishlistItems}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="font-semibold text-gray-900">
                      Addresses
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {USER_STATS.savedAddresses}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-bold text-gray-900">Quick Links</h3>
              </CardHeader>
              <CardContent className="space-y-2">
                <a
                  href="/orders"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-700">My Orders</span>
                  <span className="text-gray-400">→</span>
                </a>
                <a
                  href="/addresses"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-700">Saved Addresses</span>
                  <span className="text-gray-400">→</span>
                </a>
                <a
                  href="/wishlist"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-700">Wishlist</span>
                  <span className="text-gray-400">→</span>
                </a>
                <a
                  href="/settings"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-700">Settings</span>
                  <span className="text-gray-400">→</span>
                </a>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">
                    Personal Information
                  </h3>
                  {isEditing && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleCancel}
                        disabled={isSaving}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving}
                        isLoading={isSaving}
                      >
                        <Save className="w-4 h-4 mr-1" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors"
                      placeholder="Enter your name"
                    />
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-900 font-medium">{user.name}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors"
                      placeholder="Enter your email"
                    />
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-900 font-medium">{user.email}</p>
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Note:</p>
                      <p>
                        Changing your email will require verification. You'll
                        receive a confirmation link at your new email address.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-xl font-bold text-gray-900">
                  Account Information
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 text-gray-600 mb-1">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-semibold">User ID</span>
                    </div>
                    <p className="text-gray-900 font-mono text-sm break-all">
                      {user.id}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 text-gray-600 mb-1">
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
                    <div className="flex items-center space-x-2 text-gray-600 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        Member Since
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 text-gray-600 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        Last Updated
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {formatDate(user.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2 text-gray-600 mb-1">
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
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    ) : (
                      <AlertCircle className="w-8 h-8 text-yellow-600" />
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
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">
                        Change Password
                      </p>
                      <p className="text-sm text-gray-600">
                        Update your password regularly
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>

                <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">
                        Two-Factor Authentication
                      </p>
                      <p className="text-sm text-gray-600">
                        Add an extra layer of security
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>

                <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">
                        Privacy Settings
                      </p>
                      <p className="text-sm text-gray-600">
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
                <h3 className="text-xl font-bold text-red-600">Danger Zone</h3>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 mb-4">
                    Once you delete your account, there is no going back. Please
                    be certain.
                  </p>
                  <Button variant="danger" size="sm">
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
