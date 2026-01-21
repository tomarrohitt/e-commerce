// import { getTokenFromSession, getUserFromSession } from "@/lib/user-auth";
// import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const [user, token] = await Promise.all([
  //   getUserFromSession(),
  //   getTokenFromSession(),
  // ]);

  // if (!token && !user) return redirect("/sign-in");
  return <div>{children} </div>;
}
