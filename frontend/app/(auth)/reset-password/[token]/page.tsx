import { baseApi } from "@/lib/api/baseApi";
import { Lock } from "lucide-react";
import { ResetPasswordForm } from "./reset-password-form";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    token: string;
  }>;
}
const ResetPasswordPage = async (props: Props) => {
  const { token } = await props.params;

  if (!token) {
    notFound();
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-auto">
      <div className="text-center mb-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
          <Lock className="h-6 w-6 text-blue-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Reset Password
        </h1>
        <p className="text-gray-500">Enter your new password below.</p>
      </div>
      <ResetPasswordForm token={token} />
    </div>
  );
};

export default ResetPasswordPage;
