"use server";

import { api } from "@/lib/api/server";
import { simplifyZodErrors } from "@/lib/error-simplifier";
import { getUserFromSession } from "@/lib/user-auth";
import {
  createAddressSchema,
  type CreateAddressInput,
  type UpdateAddressInput,
} from "@/types";
import { updateAddressSchema } from "@/types/address";
import { revalidateTag } from "next/cache";
import z from "zod";

export async function createAddress(_: any, formData: FormData) {
  const data = Object.fromEntries(formData) as CreateAddressInput;
  const result = createAddressSchema.safeParse(data);

  if (!result.success) {
    const formattedErrors = z.treeifyError(result.error);
    return {
      success: false,
      message: "Validation failed",
      errors: simplifyZodErrors(formattedErrors),
      inputs: data,
    };
  }

  try {
    const res = await api("/addresses", {
      method: "POST",
      body: result.data,
    });

    if (!res.ok) {
      const err = await res.json();
      throw err;
    }

    const userId = (await getUserFromSession())!.id;

    revalidateTag(`addresses-${userId}`);
    revalidateTag(`address-count-${userId}`);
    return {
      success: true,
      errors: {
        name: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        phoneNumber: "",
      },
      inputs: data,
    };
  } catch (error: any) {
    return {
      success: false,
      message:
        error?.message || error?.errors?.[0]?.message || "Request failed",
      errors: {
        name: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        phoneNumber: "",
      },
      inputs: data,
    };
  }
}

export async function updateAddress(id: string, _: any, formData: FormData) {
  const data = Object.fromEntries(formData) as UpdateAddressInput;
  const result = updateAddressSchema.safeParse(data);

  if (!result.success) {
    const formattedErrors = z.treeifyError(result.error);
    return {
      success: false,
      message: "Validation failed",
      errors: simplifyZodErrors(formattedErrors),
      inputs: data,
    };
  }

  try {
    const res = await api(`/addresses/${id}`, {
      method: "PATCH",
      body: result.data,
    });

    if (!res.ok) {
      const err = await res.json();
      throw err;
    }
    revalidateTag(`addresses-${(await getUserFromSession())!.id}`);
    return {
      success: true,
      message: "",
      errors: {
        name: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        phoneNumber: "",
      },
      inputs: data,
    };
  } catch (error: any) {
    return {
      success: false,
      message:
        error?.message || error?.errors?.[0]?.message || "Request failed",
      errors: {
        name: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        phoneNumber: "",
      },
      inputs: data,
    };
  }
}

export async function deleteAddress(id: string) {
  try {
    const res = await api(`/addresses/${id}`, { method: "DELETE" });

    if (!res.ok) {
      const err = await res.json();
      throw err;
    }

    const userId = (await getUserFromSession())!.id;

    revalidateTag(`addresses-${userId}`);
    revalidateTag(`address-count-${userId}`);
  } catch (error) {
    console.error("Error deleting address:", error);
  }
}

export async function setDefaultAddress(id: string) {
  try {
    const res = await api(`/addresses/${id}/default`, { method: "PATCH" });

    if (!res.ok) {
      const err = await res.json();
      throw err;
    }
    revalidateTag(`addresses-${(await getUserFromSession())!.id}`);
  } catch (error) {
    console.error("Error setting default address:", error);
  }
}
