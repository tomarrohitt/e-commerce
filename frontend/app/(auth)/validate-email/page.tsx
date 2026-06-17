import { ShoppingBagIcon } from "lucide-react";
import { Validate } from "./_components/validate";
import { NoToken } from "./_components/no-token";

interface ValidateEmailPageProps {
  searchParams: { token?: string };
}

export default async function ValidateEmailPage({
  searchParams,
}: ValidateEmailPageProps) {
  const token = (await searchParams).token ?? null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-5">
      <header className="mb-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <ShoppingBagIcon className="size-6 text-gray-400" />
          <span className="text-lg font-medium text-gray-900">YourStore</span>
        </div>
        <p className="text-sm text-gray-500">Email verification</p>
      </header>

      <div className="w-full max-w-sm">
        {token ? <Validate token={token} /> : <NoToken />}
      </div>

      <footer className="mt-10 text-xs text-gray-400 text-center">
        Need help?{" "}
        <a
          href="/support"
          className="underline underline-offset-2 hover:text-gray-600"
        >
          Contact support
        </a>
      </footer>
    </div>
  );
}
