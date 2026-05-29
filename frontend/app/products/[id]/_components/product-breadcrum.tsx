import { Badge } from "@/components/ui/badge";

import React from "react";
type ProductBreadcrumProps = {
  category: { name: string } | undefined;
  name: string;
};

export const ProductBreadcrum = ({ category, name }: ProductBreadcrumProps) => {
  return (
    <>
      {category && (
        <Badge variant="secondary" className={`text-xs mb-2 `}>
          {category.name}
        </Badge>
      )}

      <h1
        className={`text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight delay-75`}
      >
        {name}
      </h1>
    </>
  );
};
