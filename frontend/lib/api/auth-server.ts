import { LoginInput, LoginResponse, RegistrationInput, User } from "@/types";
import api from ".";

export async function signUp(data: RegistrationInput): Promise<User> {
  const response = await api.post("/auth/sign-up/email", data);
  return response.data;
}

export async function signIn(data: LoginInput): Promise<User> {
  const response = await api.post<LoginResponse>("/auth/sign-in/email", data);
  return response.data.user;
}

export async function signOut() {
  const response = await api.post("/auth/sign-out", {});
  console.log({ response });
  return response.data;
}

export async function getSession(): Promise<{ user: User } | null> {
  try {
    const response = await api.get("/auth/get-session");
    return response.data;
  } catch (error) {
    return null;
  }
}

export async function resendVerificationEmail(email: string) {
  const response = await api.post("/auth/resend-verification-email", {
    email,
  });
  return response.data;
}

export async function forgotPassword(email: string) {
  const response = await api.post("/auth/request-password-reset", {
    email,
  });
  return response.data;
}

export async function resetPassword(data: {
  token: string;
  newPassword: string;
}) {
  const response = await api.post("/auth/reset-password", data);
  return response.data;
}
