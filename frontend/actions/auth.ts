"use server";

import { api } from "@/lib/clients/server";
import {
  signIn,
  signUp,
  changePassword,
  forgotPassword,
  resetPassword,
  resendMail,
} from "@/lib/services/auth-server";
import { simplifyZodErrors } from "@/lib/constants/error-simplifier";
import {
  ChangePasswordInput,
  changePasswordSchema,
  forgotPasswordSchema,
  LoginInput,
  loginSchema,
  registrationSchema,
  resetPasswordSchema,
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
      message: error.errors[0].message as string,
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
  const data = Object.fromEntries(formData) as {
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

  redirect(`/email-verification?email=${result.data.email}`);
}

export async function logout() {
  try {
    await api("/auth/sign-out", {
      method: "POST",
      body: {},
      headers: {
        Origin: process.env.NEXT_PUBLIC_ORIGIN_URL || "http://localhost:3000",
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

export async function forgotPasswordAction(_: any, formData: FormData) {
  const data = Object.fromEntries(formData) as { email: string };
  const result = forgotPasswordSchema.safeParse({
    ...data,
  });

  if (!result.success) {
    const formattedErrors = z.treeifyError(result.error);
    return {
      success: false,
      message: "Validation failed",
      errors: simplifyZodErrors(formattedErrors),
      inputs: {
        email: data.email,
      },
    };
  }

  try {
    const json = await forgotPassword({
      email: result.data.email,
      redirectTo: "http://localhost:3000/reset-password",
    });

    return {
      success: json.status,
      message: json.message,
      errors: {
        email: "",
      },
      inputs: {
        email: data.email,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Server Error",
      errors: {
        email: "",
      },
      inputs: {
        email: data.email,
      },
    };
  }
}

export async function resetPasswordAction(
  token: string,
  _: any,
  formData: FormData,
) {
  const data = Object.fromEntries(formData) as {
    newPassword: string;
  };
  const result = resetPasswordSchema.safeParse({ ...data, token });

  if (!result.success) {
    const formattedErrors = z.treeifyError(result.error);
    return {
      success: false,
      message: "Validation failed",
      errors: simplifyZodErrors(formattedErrors),
      inputs: {
        newPassword: data.newPassword,
      },
    };
  }

  try {
    await resetPassword(result.data);
  } catch (error: any) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Server Error",
      errors: {
        newPassword: "",
      },
      inputs: {
        newPassword: data.newPassword,
      },
    };
  }
  redirect("/sign-in?reset=true");
}

export async function resendMailAction(email: string) {
  const result = forgotPasswordSchema.safeParse({ email });

  if (!result.success) {
    const formattedErrors = z.treeifyError(result.error);
    return {
      success: false,
      message: simplifyZodErrors(formattedErrors),
    };
  }

  try {
    const res = await resendMail(result.data);

    if (!res.ok) {
      const err = await res.json();
      return {
        success: false,
        message: err.errors[0].message as string,
      };
    }

    const json = await res.json();

    return {
      success: true,
      message: "Email Sent",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Email Send Failed",
    };
  }
}
