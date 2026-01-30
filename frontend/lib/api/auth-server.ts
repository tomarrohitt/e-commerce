import {
  ChangePasswordInput,
  LoginInput,
  LoginResponse,
  RegistrationInput,
  User,
} from "@/types";
import { cookies } from "next/headers";
import { api } from "./server";
import { baseApi } from "./baseApi";

export async function signUp(data: RegistrationInput): Promise<User> {
  const res = await baseApi("/auth/sign-up/email", {
    method: "POST",
    body: data,
  });

  if (!res.ok) {
    const err = await res.json();
    throw err;
  }

  const json = await res.json();
  return json;
}

export async function signIn(data: LoginInput): Promise<User> {
  const res = await baseApi("/auth/sign-in/email", {
    method: "POST",
    body: data,
  });

  if (!res.ok) {
    const err = await res.json();
    throw err;
  }

  const rawSetCookie = res.headers.get("set-cookie") || "";
  const cookieHeader = rawSetCookie
    ? rawSetCookie.split(/,(?=\s*[^;]+=[^;]+)/)
    : [];

  const cookieStore = await cookies();
  cookieHeader.forEach((cookieString: string) => {
    const [nameValue] = cookieString.split(";");
    const [name, ...rest] = nameValue.split("=");
    const value = rest.join("=");

    if (name && value) {
      const cleanValue = decodeURIComponent(value);

      cookieStore.set({
        name: name.trim(),
        value: cleanValue,
        httpOnly: true,
        path: "/",
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
      });
    }
  });

  const json = (await res.json()) as LoginResponse;
  return json.user;
}

export async function signOut() {
  const res = await api("/auth/sign-out", {
    method: "POST",
    body: {},
  });

  if (!res.ok) {
    const err = await res.json();
    throw err;
  }

  return await res.json();
}

export async function getSession(): Promise<{ user: User } | null> {
  try {
    const res = await api("/auth/get-session");

    if (!res.ok) return null;

    return await res.json();
  } catch {
    return null;
  }
}

export async function resendVerificationEmail(email: string) {
  const res = await baseApi("/auth/resend-verification-email", {
    method: "POST",
    body: { email },
  });

  if (!res.ok) {
    const err = await res.json();
    throw err;
  }

  return await res.json();
}

export async function forgotPassword(data: {
  email: string;
  redirectTo: string;
}): Promise<{ status: boolean; message: string }> {
  const res = await baseApi("/auth/request-password-reset", {
    method: "POST",
    body: data,
  });

  if (!res.ok) {
    const err = await res.json();
    throw err;
  }

  return await res.json();
}

export async function resetPassword(data: {
  token: string;
  newPassword: string;
}) {
  const res = await baseApi("/auth/reset-password", {
    method: "POST",
    body: data,
  });

  if (!res.ok) {
    const err = await res.json();
    throw err;
  }

  return await res.json();
}

export async function refreshSession() {
  const res = await api("/auth/get-session", {
    headers: {
      "x-skip-cache": "true",
    },
  });

  if (!res.ok) return;

  const rawSetCookie = res.headers.get("set-cookie");
  if (!rawSetCookie) return;

  const cookieStore = await cookies();
  const cookieHeaders = rawSetCookie.split(/,(?=\s*[^;]+=[^;]+)/);

  cookieHeaders.forEach((cookieString) => {
    const [nameValue] = cookieString.split(";");
    const [name, ...rest] = nameValue.split("=");
    const value = rest.join("=");

    if (name && value) {
      const cleanValue = decodeURIComponent(value);

      cookieStore.set({
        name: name.trim(),
        value: cleanValue,
        httpOnly: true,
        path: "/",
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });
    }
  });
}

export async function changePassword(data: ChangePasswordInput) {
  const res = await api("/auth/change-password", {
    method: "POST",
    body: data,
  });

  return res;
}
export async function resendMail(data: { email: string }) {
  const res = await api("/auth/send-verification-email", {
    method: "POST",
    body: data,
  });

  return res;
}
