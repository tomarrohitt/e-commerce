import { LottieAnimation } from "@/components/lottie";
import NotFoundLottie from "@/public/lottie/not-found.json";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center p-5 relative overflow-hidden">
      <div className="absolute w-75 h-75 bg-blue-600 rounded-full opacity-10 -top-24 -left-24 animate-pulse" />
      <div className="absolute w-50 h-50 bg-blue-500 rounded-full opacity-10 -bottom-12 -right-12 animate-pulse delay-1000" />
      <div className="absolute w-37.5 h-37.5 bg-blue-400 rounded-full opacity-10 top-1/2 right-[10%] animate-pulse delay-2000" />

      <div className="max-w-3xl w-full text-center relative z-10">
        <div className="relative flex items-center justify-center">
          <LottieAnimation data={NotFoundLottie} className="size-120" />
        </div>
        <div className="h-20" />

        <div className="absolute top-100 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <p className="text-lg text-gray-600 w-2xl mx-auto">
            The page you&apos;re looking for seems to have wandered off.
            Don&apos;t worry, even the best shoppers take a wrong turn
            sometimes!
          </p>
        </div>
      </div>
    </div>
  );
}
