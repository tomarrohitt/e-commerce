import { LottieAnimation } from "@/components/lottie";
import Auth from "@/public/lottie/auth.json";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auth - E-commerce",
  description: "Sign in or create an account",
};

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-lvh bg-linear-to-br from-blue-600 via-blue-700 to-indigo-900 flex items-center justify-center lg:justify-between p-6 lg:p-14 xl:p-20 gap-8 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-md h-112 bg-indigo-700/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="hidden lg:flex flex-1 flex-col items-center justify-center gap-8 w-full max-w-xl relative z-10">
        <LottieAnimation
          data={Auth}
          className="w-85 xl:w-100 drop-shadow-2xl"
        />
        <div className="text-center">
          <p className="text-blue-100 text-lg font-medium tracking-wide">
            Your store, your style.
          </p>
          <p className="text-blue-200/70 text-sm mt-1">
            Shop thousands of products with confidence.
          </p>
        </div>
      </div>

      <div className="w-full max-w-md shrink-0 relative z-10">{children}</div>
    </div>
  );
}
