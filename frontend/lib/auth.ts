// src/lib/auth.ts
import { SignUpData, SignInData, User } from "@/types";
import api from "./api";

export const authService = {
  /**
   * Sign up new user
   */
  async signUp(data: SignUpData) {
    const response = await api.post("/auth/sign-up/email", data);
    return response.data;
  },

  /**
   * Sign in user
   */
  async signIn(data: SignInData) {
    const response = await api.post("/auth/sign-in/email", data);
    return response.data;
  },

  /**
   * Sign out user
   */
  async signOut() {
    const response = await api.post("/auth/sign-out");
    return response.data;
  },

  /**
   * Get current session
   */
  async getSession(): Promise<{ user: User } | null> {
    try {
      const response = await api.get("/auth/get-session");
      return response.data;
    } catch (error) {
      return null;
    }
  },
};
