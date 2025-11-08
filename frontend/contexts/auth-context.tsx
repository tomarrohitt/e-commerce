"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth";
import type { SignInData, User } from "@/types";
import toast from "react-hot-toast";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (data: SignInData) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await authService.getSession();
        if (session) {
          setUser(session.user);
        }
      } catch (error) {
        // This is normal if the user isn't logged in
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []); // The empty array [] means this runs only once

  // 5. Define app-wide sign-in function
  const signIn = async (data: SignInData) => {
    try {
      const { user } = await authService.signIn(data);
      setUser(user); // Update the state (our cache)
      toast.success("Welcome back!");
      router.push("/");
    } catch (error: any) {
      toast.error(error.error || "Sign-in failed");
      throw error;
    }
  };

  // 6. Define app-wide sign-out function
  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null); // Clear the state (our cache)
      toast.success("Signed out successfully");
      router.push("/sign-in");
    } catch (error: any) {
      toast.error(error.error || "Sign-out failed");
    }
  };

  const isAuthenticated = !!user;

  // 7. Provide all values to the app
  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 8. Create the custom hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
