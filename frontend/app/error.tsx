"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center p-5 relative overflow-hidden">
      {/* Animated background decorations */}
      <div className="absolute w-75 h-75 bg-blue-600 rounded-full opacity-10 -top-24 -left-24 animate-pulse" />
      <div className="absolute w-50 h-50 bg-blue-500 rounded-full opacity-10 -bottom-12 -right-12 animate-pulse delay-1000" />
      <div className="absolute w-37.5 h-37.5 bg-blue-400 rounded-full opacity-10 top-1/2 right-[10%] animate-pulse delay-2000" />

      <div className="max-w-2xl w-full text-center relative z-10">
        {/* Error Icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-600 rounded-full blur-2xl opacity-20 animate-pulse" />
            <div className="relative bg-linear-to-br from-blue-600 to-blue-400 p-6 rounded-full">
              <AlertCircle className="h-16 w-16 text-white" />
            </div>
          </div>
        </div>

        {/* Heading and Description */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Something Went Wrong
        </h1>
        <p className="text-lg text-gray-600 mb-10 max-w-xl mx-auto">
          We encountered an unexpected error while processing your request. Our
          team has been notified and we&apos;re working to fix it.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center flex-wrap mb-10">
          <Button
            onClick={reset}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Try Again
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Error Details Card (for development) */}
        {process.env.NODE_ENV === "development" && (
          <Card className="shadow-lg text-left">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                Error Details (Development Only)
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 overflow-auto">
                <p className="text-sm font-mono text-gray-700 mb-2">
                  <span className="font-semibold">Message:</span>{" "}
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-sm font-mono text-gray-600">
                    <span className="font-semibold">Digest:</span>{" "}
                    {error.digest}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Support Message */}
        <p className="text-sm text-gray-500 mt-8">
          If this problem persists, please{" "}
          <Link
            href="/support"
            className="text-blue-600 hover:text-blue-700 font-medium underline"
          >
            contact our support team
          </Link>
        </p>
      </div>
    </div>
  );
}
