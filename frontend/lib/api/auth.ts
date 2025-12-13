import { LoginInput, LoginResponse, RegistrationInput, User } from "@/types";
import api from ".";

export const authService = {
  async signUp(data: RegistrationInput): Promise<User> {
    const response = await api.post("/auth/sign-up/email", data);
    return response.data;
  },

  async signIn(data: LoginInput): Promise<User> {
    const response = await api.post<LoginResponse>("/auth/sign-in/email", data);
    return response.data.user;
  },

  async signOut() {
    const response = await api.post("/auth/sign-out");
    return response.data;
  },

  async getSession(): Promise<{ user: User } | null> {
    try {
      const response = await api.get("/auth/get-session");
      return response.data;
    } catch (error) {
      return null;
    }
  },
};
