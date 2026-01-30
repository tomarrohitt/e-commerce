import { logout } from "@/actions/auth";
import { useTransition } from "react";

export const LogoutButton = () => {
  const [pending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logout();
    });
  }

  return (
    <button
      onClick={handleLogout}
      disabled={pending}
      className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
    >
      Sign Out
    </button>
  );
};
