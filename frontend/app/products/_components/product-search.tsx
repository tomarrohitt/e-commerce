"use client";

import { Input } from "@/components/ui/input";
import { entranceAnim } from "@/lib/constants/enter-animation";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export const ProductSearch = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [value, setValue] = useState(searchParams.get("q") ?? "");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const params = new URLSearchParams(searchParams.toString());

    if (value.trim()) {
      params.set("q", value.trim());
    } else {
      params.delete("q");
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <form
      onSubmit={onSubmit}
      className={`relative max-w-2xl mx-auto ${entranceAnim} delay-200`}
    >
      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 z-10" />
        <Input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search for products"
          className="w-full pl-16 pr-6 py-7 text-lg bg-white/95 backdrop-blur-xl border-2 border-white/50 rounded-2xl shadow-2xl shadow-black/10"
        />
      </div>
    </form>
  );
};
