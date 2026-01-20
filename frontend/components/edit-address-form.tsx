"use client";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useActionState } from "react";
import { createAddress, updateAddress } from "@/actions/address";
import { FormIds } from "@/lib/constants";

import { FormFooter } from "./form-footer";
import { Address } from "@/types";

export default function EditAddressForm({ address }: { address: Address }) {
  const initialState = {
    success: false,
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
    inputs: {
      name: address.name,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      phoneNumber: address.phoneNumber,
    },
  };

  const updateAddressWithId = updateAddress.bind(null, address.id);
  const [state, action, pending] = useActionState(
    updateAddressWithId,
    initialState,
  );
  return (
    <>
      <form
        id={FormIds.ADD_ADDRESS}
        action={action}
        className="space-y-2 w-full mx-auto py-2"
      >
        <div className="grid grid-cols-8 space-x-4 space-y-2">
          <div className="col-span-4">
            <Field className="gap-y-2">
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                placeholder="John Doe"
                name="name"
                defaultValue={state.inputs.name}
              />

              <FieldError className="my-1 text-xs">
                {state.errors.name}
              </FieldError>
            </Field>
          </div>
          <div className="col-span-4">
            <Field className="gap-y-2">
              <FieldLabel htmlFor="phoneNumber">Phone number</FieldLabel>
              <Input
                id="phoneNumber"
                placeholder="+1 (555) 1234 567"
                name="phoneNumber"
                defaultValue={state.inputs.phoneNumber}
              />
              <FieldError className="my-1 text-xs">
                {state.errors.phoneNumber}
              </FieldError>
            </Field>
          </div>
        </div>

        <Field>
          <FieldLabel htmlFor="street">Street</FieldLabel>
          <Input
            id="street"
            placeholder="123 Main Street, Apt 4B"
            name="street"
            defaultValue={state.inputs.street}
          />
          <FieldError className="my-1 text-xs">
            {state.errors.street}
          </FieldError>
        </Field>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-4">
            <Field className="gap-y-2">
              <FieldLabel htmlFor="city">City</FieldLabel>
              <Input
                id="city"
                placeholder="New York"
                name="city"
                defaultValue={state.inputs.city}
              />

              <FieldError className="my-1 text-xs">
                {state.errors.city}
              </FieldError>
            </Field>
          </div>

          <div className="col-span-4">
            <Field className="gap-y-2">
              <FieldLabel htmlFor="state">State</FieldLabel>
              <Input
                id="state"
                placeholder="NY"
                name="state"
                defaultValue={state.inputs.state}
              />

              <FieldError className="my-1 text-xs">
                {state.errors.state}
              </FieldError>
            </Field>
          </div>

          <div className="col-span-4">
            <Field className="gap-y-2">
              <FieldLabel htmlFor="zipCode">ZIP Code</FieldLabel>
              <Input
                id="zipCode"
                placeholder="10001"
                name="zipCode"
                defaultValue={state.inputs.zipCode}
              />

              <FieldError className="my-1 text-xs">
                {state.errors.zipCode}
              </FieldError>
            </Field>
          </div>
        </div>

        <Field className="gap-y-2">
          <FieldLabel htmlFor="country">Country</FieldLabel>
          <Input
            id="country"
            placeholder="United States"
            name="country"
            defaultValue={state.inputs.country}
          />

          <FieldError className="my-1 text-xs">
            {state.errors.country}
          </FieldError>
        </Field>
      </form>
      <FormFooter formId={FormIds.ADD_ADDRESS} pending={pending} />
    </>
  );
}
