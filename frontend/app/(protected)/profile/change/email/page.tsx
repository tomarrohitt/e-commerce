import { Mail, Verified } from "lucide-react";
import { ChangeEmailForm } from "./change-email-form";
import { entranceAnim } from "@/lib/constants/enter-animation";

export default function ChangeEmailPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-3">
        <div
          className={`flex items-center gap-3 mb-4 ${entranceAnim} delay-100`}
        >
          <div className="p-3 bg-linear-to-br from-blue-600 to-blue-500 rounded-2xl shadow-lg shadow-blue-600/30">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Change Email Address
            </h2>
            <p className="text-sm text-gray-600 mt-0.5">
              Update the email associated with your account
            </p>
          </div>
        </div>

        <div
          className={`bg-green-50 rounded-lg px-4 py-3 border border-green-200 ${entranceAnim} delay-150`}
        >
          <div className="flex items-center gap-2 text-sm">
            <Verified className="w-4 h-4 text-green-600" />
            <span className="text-green-900 font-medium">
              Current email is verified
            </span>
          </div>
        </div>
      </div>

      <ChangeEmailForm />
    </div>
  );
}
