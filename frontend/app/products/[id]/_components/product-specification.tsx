import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import { AttributeRenderer } from "./attribute-rendered";
import { AttributeDefinition } from "@/types";

export const ProductSpecification = ({
  attributeSchema,
  attributes,
  sku,
  updatedAt,
}: {
  attributeSchema: AttributeDefinition[] | undefined;
  attributes: Record<string, any> | undefined;
  sku: string;
  updatedAt: string;
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Specifications</h2>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-1">
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="font-semibold text-gray-900">SKU</span>
              <span className="text-gray-700">{sku}</span>
            </div>

            {attributeSchema?.map((schema) => {
              const value = (attributes as Record<string, any>)[schema.key];
              if (value === undefined || value === null) return null;

              return (
                <AttributeRenderer
                  key={schema.key}
                  attribute={schema}
                  value={value}
                />
              );
            })}
            <div className="flex justify-between py-3">
              <span className="font-semibold text-gray-900">Last Updated</span>
              <span className="text-gray-700">
                {new Date(updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
