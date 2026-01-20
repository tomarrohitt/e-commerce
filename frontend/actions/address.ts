"use server";

import api from "@/lib/api";
import { simplifyZodErrors } from "@/lib/error-simplifier";
import { getUserFromSession } from "@/lib/user-auth";
import {
  createAddressSchema,
  type CreateAddressInput,
  type UpdateAddressInput,
} from "@/types";
import { updateAddressSchema } from "@/types/address";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
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
      inputs: {
        name: data.name,
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        phoneNumber: data.phoneNumber,
      },
    };
  }

  try {
    await api.post("/addresses", result.data);
    const user = await getUserFromSession();
    updateTag(`addresses-${user!.id}`);
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
      inputs: {
        name: data.name,
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        phoneNumber: data.phoneNumber,
      },
    };
  } catch (error: any) {
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
        errors: {
          name: "",
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
          phoneNumber: "",
        },
        inputs: {
          name: data.name,
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
          phoneNumber: data.phoneNumber,
        },
      };
    }
    return {
      success: false,
      message: error.errors[0].message,
      errors: {
        name: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        phoneNumber: "",
      },
      inputs: {
        name: data.name,
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        phoneNumber: data.phoneNumber,
      },
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
      inputs: {
        name: data.name,
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        phoneNumber: data.phoneNumber,
      },
    };
  }
  try {
    await api.patch(`/addresses/${id}`, result.data);
    const user = await getUserFromSession();
    updateTag(`addresses-${user!.id}`);
  } catch (error: any) {
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
        errors: {
          name: "",
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
          phoneNumber: "",
        },
        inputs: {
          name: data.name,
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
          phoneNumber: data.phoneNumber,
        },
      };
    }
    return {
      success: false,
      message: error.errors[0].message,
      errors: {
        name: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        phoneNumber: "",
      },
      inputs: {
        name: data.name,
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        phoneNumber: data.phoneNumber,
      },
    };
  }
  redirect("/addresses");
}

export async function deleteAddress(id: string, userId: string) {
  try {
    await api.delete(`/addresses/${id}`);
    updateTag(`addresses-${userId}`);
  } catch (error) {
    console.error("Error removing item from cart:", error);
  }
}

export async function setDefaultAddress(id: string, userId: string) {
  try {
    await api.patch(`/addresses/${id}/default`);
    updateTag(`addresses-${userId}`);
  } catch (error) {
    console.error("Error removing item from cart:", error);
  }
}
