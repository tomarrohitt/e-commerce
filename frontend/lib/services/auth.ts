import { LoginInput, LoginResponse, RegistrationInput, User } from "@/types";
import { api } from "@/lib/clients/server";

export const authService = {
  async signUp(data: RegistrationInput): Promise<User> {
    const res = await api("/auth/sign-up/email", {
      method: "POST",
      body: data,
    });

    if (!res.ok) throw await res.json();
    return await res.json();
  },

  async signIn(data: LoginInput): Promise<User> {
    const res = await api("/auth/sign-in/email", {
      method: "POST",
      body: data,
    });

    if (!res.ok) throw await res.json();
    const json = (await res.json()) as LoginResponse;
    return json.user;
  },

  async signOut() {
    const res = await api("/auth/sign-out", {
      method: "POST",
      body: {},
    });

    if (!res.ok) throw await res.json();
    return await res.json();
  },

  async getSession(): Promise<{ user: User } | null> {
    try {
      const res = await api("/auth/get-session");
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async resendVerificationEmail(email: string) {
    const res = await api("/auth/resend-verification-email", {
      method: "POST",
      body: { email },
    });

    if (!res.ok) throw await res.json();
    return await res.json();
  },

  async forgotPassword(email: string) {
    const res = await api("/auth/request-password-reset", {
      method: "POST",
      body: { email },
    });

    if (!res.ok) throw await res.json();
    return await res.json();
  },

  async resetPassword(data: { token: string; newPassword: string }) {
    const res = await api("/auth/reset-password", {
      method: "POST",
      body: data,
    });

    if (!res.ok) throw await res.json();
    return await res.json();
  },
};
