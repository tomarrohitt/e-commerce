import { ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";

const SuccessPage = () => {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-auto text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
        <CheckCircle className="h-8 w-8 text-green-500" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Reset!</h1>
      <p className="text-gray-500 mb-8">
        Your password has been successfully updated. You can now log in with
        your new credentials.
      </p>

      <Link
        href="/sign-in"
        className="inline-flex items-center justify-center w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
      >
        Continue to Sign In
        <ArrowRight className="h-4 w-4 ml-2" />
      </Link>
    </div>
  );
};

export default SuccessPage;
