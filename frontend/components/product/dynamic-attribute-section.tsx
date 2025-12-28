"use client";

import { AttributeRenderer } from "./attribute-renderer";
import { AttributeDefinition } from "@/types"; // Adjust path as needed

interface DynamicAttributesSectionProps {
  // The actual values from product.attributes
  attributes: Record<string, any> | undefined;
  // The rules from category.attributeSchema
  schema: AttributeDefinition[] | undefined;
}

export function DynamicAttributesSection({
  attributes,
  schema,
}: DynamicAttributesSectionProps) {
  // 1. Safety Checks
  if (!attributes || !schema || schema.length === 0) {
    return (
      <div className="text-gray-500 italic py-4">
        No specific details available for this product.
      </div>
    );
  }

  // 2. Filter: Only show attributes that actually have data
  const validAttributes = schema.filter((attr) => {
    const value = attributes[attr.key];
    // Check for non-null, non-undefined, and non-empty string
    // We allow "0" (number) or "false" (boolean), so strict check is needed
    return value !== null && value !== undefined && value !== "";
  });

  if (validAttributes.length === 0) {
    return (
      <div className="text-gray-500 italic py-4">
        No specifications provided.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
          Technical Specifications
        </h3>

        <div className="divide-y divide-gray-100">
          {validAttributes.map((attr) => (
            <AttributeRenderer
              key={attr.key}
              attribute={attr}
              value={attributes[attr.key]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
