import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const SuccessPage = () => {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-8 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 border border-white/20 mb-5">
        <CheckCircle2 className="h-8 w-8 text-emerald-300" />
      </div>

      <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
        Password updated
      </h1>
      <p className="text-blue-200 text-sm leading-relaxed mb-8">
        Your password has been changed successfully. You can now sign in with
        your new credentials.
      </p>

      <Link
        href="/sign-in"
        className="inline-flex items-center justify-center w-full bg-white text-blue-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:bg-blue-50 active:scale-[0.98] shadow-lg shadow-black/10"
      >
        Continue to sign in
        <ArrowRight className="h-4 w-4 ml-2" />
      </Link>
    </div>
  );
};

export default SuccessPage;
