"use client";

import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  type Dispatch,
  type SetStateAction,
  useActionState,
  useEffect,
} from "react";
import { createAddress } from "@/actions/address";
import { FormIds } from "@/lib/constants";

import { FormFooter } from "./form-footer";

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
    name: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phoneNumber: "",
  },
};

export default function AddAddressForm({
  setOpen,
}: {
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const [state, action, pending] = useActionState(createAddress, initialState);

  useEffect(() => {
    if (state.success) {
      setOpen(false);
    }
  }, [state.success, setOpen]);
  return (
    <>
      <form
        id={FormIds.ADD_ADDRESS}
        action={action}
        className="space-y-2 w-full mx-auto py-2"
      >
        <div className="grid grid-cols-8 space-x-4 space-y-2">
          <div className="col-span-4">
            <Field className="gap-0">
              <FieldLabel className="mb-1" htmlFor="name">
                Name
              </FieldLabel>
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
            <Field className="gap-0">
              <FieldLabel className="mb-1" htmlFor="phoneNumber">
                Phone number
              </FieldLabel>
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

        <Field className="gap-0">
          <FieldLabel className="mb-1" htmlFor="street">
            Street
          </FieldLabel>
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
            <Field className="gap-0">
              <FieldLabel className="mb-1" htmlFor="city">
                City
              </FieldLabel>
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
            <Field className="gap-0">
              <FieldLabel className="mb-1" htmlFor="state">
                State
              </FieldLabel>
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
            <Field className="gap-0">
              <FieldLabel className="mb-1" htmlFor="zipCode">
                ZIP Code
              </FieldLabel>
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

        <Field className="gap-0">
          <FieldLabel className="mb-1" htmlFor="country">
            Country
          </FieldLabel>
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
