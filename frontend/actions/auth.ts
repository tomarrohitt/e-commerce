"use server";

import { api } from "@/lib/api/server";
import { signIn, signUp, changePassword } from "@/lib/api/auth-server";
import { simplifyZodErrors } from "@/lib/error-simplifier";
import {
  ChangePasswordInput,
  changePasswordSchema,
  LoginInput,
  loginSchema,
  registrationSchema,
} from "@/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import z from "zod";

export async function login(redirectTo: string, _: any, formData: FormData) {
  const data = Object.fromEntries(formData) as LoginInput;
  const result = loginSchema.safeParse(data);

  if (!result.success) {
    const formattedErrors = z.treeifyError(result.error);

    return {
      success: false,
      message: "Validation failed",
      errors: simplifyZodErrors(formattedErrors),
      inputs: {
        email: data.email,
        password: "",
      },
    };
  }

  try {
    await signIn(result.data);
  } catch (error: any) {
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
        errors: {
          email: "",
          password: "",
        },
        inputs: {
          email: data.email,
          password: "",
        },
      };
    }
    return {
      success: false,
      message: "",
      errors: {
        email: "",
        password: "",
      },
      inputs: {
        email: data.email,
        password: "",
      },
    };
  }
  redirect(redirectTo);
}
export async function register(_: any, formData: FormData) {
  const data = Object.fromEntries(formData.entries()) as {
    name: string;
    email: string;
    password: string;
  };
  const result = registrationSchema.safeParse(data);

  if (!result.success) {
    const formattedErrors = z.treeifyError(result.error);
    return {
      success: false,
      message: "Validation failed",
      errors: simplifyZodErrors(formattedErrors),
      inputs: {
        name: data.name,
        email: data.email,
        password: "",
      },
    };
  }

  try {
    await signUp(result.data);
  } catch (error: any) {
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
        errors: {
          name: "",
          email: "",
          password: "",
        },
        inputs: {
          name: data.name,
          email: data.email,
          password: "",
        },
      };
    }
    return {
      success: false,
      message: error.errors[0].message as string,
      errors: {
        name: "",
        email: "",
        password: "",
      },
      inputs: {
        name: data.name,
        email: data.email,
        password: "",
      },
    };
  }

  redirect("/email-verification");
}

export async function logout() {
  try {
    await api("/auth/sign-out", {
      method: "POST",
      body: {},
      headers: {
        Origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      },
    });
  } catch (error) {}
  const cookieStore = await cookies();
  cookieStore.getAll().forEach((cookie) => {
    cookieStore.delete(cookie.name);
  });
  redirect("/sign-in");
}
export async function changePasswordAction(_: any, formData: FormData) {
  const data = Object.fromEntries(formData) as ChangePasswordInput;
  const result = changePasswordSchema.safeParse(data);

  if (!result.success) {
    const formattedErrors = z.treeifyError(result.error);
    return {
      success: false,
      message: "Validation failed",
      errors: simplifyZodErrors(formattedErrors),
      inputs: {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
    };
  }

  try {
    const res = await changePassword(result.data);

    if (!res.ok) {
      const err = await res.json();
      return {
        success: false,
        message: err.message || "Failed to update password",
        errors: {
          currentPassword: err.errors?.[0]?.message || "Invalid password",
          newPassword: "",
        },
        inputs: {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
      };
    }

    return {
      success: true,
      message: "Password Changed Successfully",
      errors: {
        currentPassword: "",
        newPassword: "",
      },
      inputs: {
        currentPassword: "",
        newPassword: "",
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Server Error",
      errors: {
        currentPassword: "",
        newPassword: "",
      },
      inputs: {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
    };
  }
}
