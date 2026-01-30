"use client";

import { Check, X, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AttributeDefinition {
  key: string;
  type: string;
  label: string;
  unit?: string;
  searchable?: boolean;
}

interface AttributeRendererProps {
  attribute: AttributeDefinition;
  value: any;
}

export function AttributeRenderer({
  attribute,
  value,
}: AttributeRendererProps) {
  if (value === null || value === undefined || value === "") return null;

  const renderValue = () => {
    switch (attribute.type) {
      case "boolean":
        return (
          <div className="flex items-center gap-2">
            {value ? (
              <>
                <div className="bg-green-100 text-green-700 p-1 rounded-full">
                  <Check className="w-4 h-4" />
                </div>
                <span className="text-gray-700 font-medium">Yes</span>
              </>
            ) : (
              <>
                <div className="bg-red-100 text-red-700 p-1 rounded-full">
                  <X className="w-4 h-4" />
                </div>
                <span className="text-gray-700 font-medium">No</span>
              </>
            )}
          </div>
        );

      case "color":
        return (
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm"
              style={{ backgroundColor: String(value) }}
            />
            <span className="text-gray-700 font-medium capitalize">
              {String(value)}
            </span>
          </div>
        );

      case "number":
        return (
          <span className="text-gray-900 font-semibold">
            {value}
            {attribute.unit && (
              <span className="text-gray-500 text-sm ml-1 font-normal">
                {attribute.unit}
              </span>
            )}
          </span>
        );

      case "multiselect":
        if (Array.isArray(value)) {
          return (
            <div className="flex flex-wrap gap-2">
              {value.map((item, index) => (
                <Badge key={index} variant="secondary">
                  {item}
                </Badge>
              ))}
            </div>
          );
        }
        return (
          <span className="text-gray-700 font-medium">{String(value)}</span>
        );

      case "url":
        return (
          <a
            href={String(value)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline transition-colors font-medium"
          >
            <span>View Link</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        );

      default:
        return (
          <span className="text-gray-700 font-medium">{String(value)}</span>
        );
    }
  };

  return (
    <div className="flex justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors px-2 -mx-2 rounded-lg">
      <span className="font-semibold text-gray-900">{attribute.label}</span>
      <div className="text-right">{renderValue()}</div>
    </div>
  );
}
