import type { ReactNode } from "react";
import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";
import { entranceAnim } from "@/lib/constants/enter-animation";

export default function SecurityLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-linear-to-br from-blue-50 via-white to-blue-50/30 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Content Container */}
      <div className="relative mx-auto max-w-7xl px-4 py-10">
        {/* Back Navigation */}
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Profile
        </Link>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-6">
            <div className={`relative ${entranceAnim}`}>
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-linear-to-br from-blue-600 to-blue-400 rounded-2xl opacity-10 blur-xl" />

              <div className="relative bg-linear-to-br from-blue-600 to-blue-500 rounded-3xl p-8 text-white shadow-2xl shadow-blue-600/20">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <Shield className="w-8 h-8" />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse delay-75" />
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse delay-150" />
                  </div>
                </div>

                <h1 className="text-3xl font-bold mb-3">Security Settings</h1>
                <p className="text-blue-50 leading-relaxed">
                  Protect your account with strong authentication and regular
                  security updates.
                </p>

                {/* Security Status */}
                <div className="mt-8 pt-6 border-t border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-400/20 rounded-lg">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">
                        Account Status
                      </div>
                      <div className="text-xs text-blue-100">
                        Secure & Protected
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${entranceAnim} delay-100`}
            >
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full " />
                Security Best Practices
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  </div>
                  <span>Use a unique password for your account</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  </div>
                  <span>
                    Enable two-factor authentication for extra protection
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  </div>
                  <span>Update your password regularly</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  </div>
                  <span>Never share your credentials with anyone</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-gray-200/50 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-blue-600 via-blue-400 to-blue-600" />

              <div className="p-8 md:p-10">{children}</div>

              <div className="absolute bottom-0 right-0 w-32 h-32 bg-linear-to-tl from-blue-600/5 to-transparent rounded-tl-[100px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
