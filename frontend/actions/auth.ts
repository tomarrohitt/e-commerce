"use server";

import api from "@/lib/api";
import { signIn, signUp } from "@/lib/api/auth-server";
import { simplifyZodErrors } from "@/lib/error-simplifier";
import { LoginInput, loginSchema, registrationSchema } from "@/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import z from "zod";

export async function login(_: any, formData: FormData) {
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
      message: error.errors[0].message,
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
  redirect("/");
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
    await api.post(
      "/auth/sign-out",
      {},
      {
        headers: {
          Origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        },
      },
    );
  } catch (error) {
    console.log(JSON.stringify(error));
  }
  const cookieStore = await cookies();
  cookieStore.getAll().forEach((cookie) => {
    cookieStore.delete(cookie.name);
  });
  redirect("/sign-in");
}
