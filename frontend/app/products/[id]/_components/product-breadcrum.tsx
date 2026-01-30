import { Badge } from "@/components/ui/badge";
import { entranceAnim } from "@/lib/constants/enter-animation";
import React from "react";
type ProductBreadcrumProps = {
  category: { name: string } | undefined;
  name: string;
};

export const ProductBreadcrum = ({ category, name }: ProductBreadcrumProps) => {
  return (
    <>
      {category && (
        <Badge variant="secondary" className={`text-xs mb-2 ${entranceAnim}`}>
          {category.name}
        </Badge>
      )}

      <h1
        className={`text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight ${entranceAnim} delay-75`}
      >
        {name}
      </h1>
    </>
  );
};
