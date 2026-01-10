"use server";
import { cookies } from "next/headers";
import { loginSchema, LoginResponse } from "@/types";
import { isAxiosError } from "axios";
import api from "@/lib/api/client";
import z from "zod";
import { ProjectActionState } from "@/app/(auth)/sign-in/sign-in-form";
export async function loginAction(_: ProjectActionState, formData: FormData) {
  const data = Object.fromEntries(formData);
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    const flattened = z.treeifyError(result.error);
    return {
      success: false,
      errors: {
        email: flattened.properties?.email?.errors[0],
        password: flattened.properties?.password?.errors[0],
      },
      payload: { email: data.email, password: "" },
    };
  }
  try {
    const response = await api.post<LoginResponse>("/auth/sign-in/email", data);
    const { token, user } = response.data;
    if (token) {
      const cookieStore = await cookies();
      cookieStore.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }
    return { success: true, user };
  } catch (error: unknown) {
    let message = "Invalid credentials";
    if (isAxiosError(error) && error.response?.data?.message) {
      message = error.response.data.message;
    }
    return {
      success: false,
      message: message,
      payload: { email: data.email, password: "" },
      errors: undefined,
    };
  }
}
