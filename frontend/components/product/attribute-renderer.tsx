"use client";

import { AttributeDefinition } from "@/types";
import { Check, X, ExternalLink } from "lucide-react";

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
          <div className="flex items-center space-x-2">
            {value ? (
              <>
                <div className="bg-green-100 text-green-700 p-0.5 rounded-full">
                  <Check className="w-4 h-4" />
                </div>
                <span className="text-gray-700">Yes</span>
              </>
            ) : (
              <>
                <div className="bg-red-100 text-red-700 p-0.5 rounded-full">
                  <X className="w-4 h-4" />
                </div>
                <span className="text-gray-700">No</span>
              </>
            )}
          </div>
        );

      case "color":
        return (
          <div className="flex items-center space-x-2">
            <div
              className="w-5 h-5 rounded-full border border-gray-200 shadow-sm"
              style={{ backgroundColor: String(value) }}
            />
            <span className="text-gray-700 capitalize">{String(value)}</span>
          </div>
        );

      case "number":
        return (
          <span className="text-gray-900 font-medium">
            {value}
            {attribute.unit && (
              <span className="text-gray-500 text-sm ml-1">
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
                <span
                  key={index}
                  className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100"
                >
                  {item}
                </span>
              ))}
            </div>
          );
        }
        return <span className="text-gray-700">{String(value)}</span>;

      case "url":
        return (
          <a
            href={String(value)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-blue-500 hover:text-blue-800 hover:underline transition-colors"
          >
            <span>View Link</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        );

      default:
        return <span className="text-gray-700">{String(value)}</span>;
    }
  };

  return (
    <div className="flex justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors px-2 -mx-2 rounded-lg">
      <span className="font-semibold text-gray-900 text-sm md:text-base">
        {attribute.label}:
      </span>
      <div className="text-right text-sm md:text-base">{renderValue()}</div>
    </div>
  );
}
