import { Lock } from "lucide-react";
import { ResetPasswordForm } from "./_components/reset-password-form";
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
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 border border-white/20 mb-4">
          <Lock className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Set new password
        </h1>
        <p className="text-blue-200 text-sm mt-1.5">
          Must be at least 8 characters long.
        </p>
      </div>
      <ResetPasswordForm token={token} />
    </div>
  );
};

export default ResetPasswordPage;
