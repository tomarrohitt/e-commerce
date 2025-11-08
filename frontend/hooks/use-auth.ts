// // src/hooks/useAuth.ts
// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { authService } from "@/lib/auth";
// import type { User } from "@/types";

// export function useAuth(requireAuth = false) {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     checkAuth();
//   }, []);

//   const checkAuth = async () => {
//     try {
//       const session = await authService.getSession();

//       if (session?.user) {
//         setUser(session.user);
//       } else if (requireAuth) {
//         // Redirect to sign-in if auth is required
//         router.push("/sign-in");
//       }
//     } catch (error) {
//       console.error("Auth check failed:", error);
//       if (requireAuth) {
//         router.push("/sign-in");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const signOut = async () => {
//     try {
//       await authService.signOut();
//       setUser(null);
//       router.push("/sign-in");
//       router.refresh();
//     } catch (error) {
//       console.error("Sign out failed:", error);
//     }
//   };

//   return {
//     user,
//     loading,
//     isAuthenticated: !!user,
//     signOut,
//     refetch: checkAuth,
//   };
// }
