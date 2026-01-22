"use client";

import { Address } from "@/types";
import { CheckCircle, Home, MapPin, Phone } from "lucide-react";
import { SetToDefaultButton } from "./set-to-default-button";
import { DeleteAddressButton } from "./delete-address-button";
import { AddressDialog } from "@/components/address-modal";

import { type Transition, motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const FAST: Transition = {
  duration: 0.15,
  ease: "easeOut",
};
const cardVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const subtleHover = {
  y: -2,
  transition: FAST,
};

interface AddressListProps {
  addresses: Address[];
}

export function AddressList({ addresses }: AddressListProps) {
  if (addresses.length === 0) {
    return (
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeVariants}
        transition={FAST}
        className="bg-white rounded-2xl border border-slate-200 p-12 text-center"
      >
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <MapPin className="w-8 h-8 text-slate-400" />
        </div>

        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          No addresses found
        </h2>

        <p className="text-slate-500 mb-6 max-w-md mx-auto">
          Add a shipping address to continue with checkout.
        </p>

        <AddressDialog />
      </motion.div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <AnimatePresence>
        {addresses.map((address) => (
          <motion.div
            key={address.id}
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={FAST}
            whileHover={subtleHover}
            layout
            className={cn(
              "relative bg-white rounded-xl border flex flex-col transition-shadow",
              address.isDefault
                ? "border-blue-500 shadow-sm"
                : "border-slate-200 hover:shadow-md",
            )}
          >
            {address.isDefault && (
              <motion.div
                variants={fadeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={FAST}
                className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center"
              >
                <CheckCircle className="w-5 h-5 text-white" />
              </motion.div>
            )}

            <div className="p-6 flex flex-col flex-1">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "p-2 rounded-lg shrink-0",
                      address.isDefault ? "bg-blue-100" : "bg-slate-100",
                    )}
                  >
                    <Home
                      className={cn(
                        "w-5 h-5",
                        address.isDefault ? "text-blue-600" : "text-slate-500",
                      )}
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 truncate">
                      {address.name}
                    </h3>

                    {address.isDefault && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full mt-1">
                        <CheckCircle className="w-3 h-3" />
                        Default
                      </span>
                    )}
                  </div>
                </div>

                <AddressDialog address={address} />
              </div>

              {/* Address */}
              <div className="space-y-3 text-sm text-slate-700 flex-1">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                  <div className="leading-relaxed">
                    <div>{address.street}</div>
                    <div>
                      {address.city}, {address.state} {address.zipCode}
                    </div>
                    <div className="font-medium">{address.country}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{address.phoneNumber}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-100">
                {!address.isDefault && (
                  <motion.div
                    variants={fadeVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={FAST}
                  >
                    <SetToDefaultButton addressId={address.id} />
                  </motion.div>
                )}

                <DeleteAddressButton addressId={address.id} />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
