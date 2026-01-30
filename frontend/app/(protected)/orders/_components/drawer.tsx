"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { OrderItem } from "@/types";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import ReviewFormWrapper from "./review-form-wrapper";

interface ReviewDrawerProps {
  product: OrderItem;
  review?: string;
}

export function ReviewDrawer({ product }: ReviewDrawerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction="right">
      <DrawerTrigger asChild>
        <Button className="rounded-full bg-blue-500 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20 transition-all hover:scale-105 active:scale-95 gap-2 px-6 absolute right-24">
          <Sparkles className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          Write a Review
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <div className="mx-auto w-full max-w-sm ">
          <DrawerHeader>
            <DrawerTitle>Review Product</DrawerTitle>
            <DrawerDescription>
              How was your experience with this item?
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4 space-y-6 mt-8">
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="relative h-12 w-12 overflow-hidden rounded-md border">
                <Image
                  src={product.thumbnail}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  ${product.price}
                </p>
              </div>
            </div>

            <ReviewFormWrapper
              productId={product.productId}
              setOpen={setIsOpen}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
