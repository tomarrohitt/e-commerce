import { AttributeDefinition } from "@/types";

export const CATEGORY_SCHEMAS: Record<string, AttributeDefinition[]> = {
  books: [
    { key: "author", label: "Author", type: "text", searchable: true },
    { key: "isbn", label: "ISBN", type: "text", searchable: true },
    { key: "publisher", label: "Publisher", type: "text" },
    { key: "publishedDate", label: "Published Date", type: "text" },
    { key: "pages", label: "Number of Pages", type: "number", unit: "pages" },
    { key: "language", label: "Language", type: "text" },
    {
      key: "format",
      label: "Format",
      type: "select",
      options: ["Hardcover", "Paperback", "Kindle", "eBook"],
    },
    { key: "dimensions", label: "Dimensions", type: "text", unit: "inches" },
    { key: "weight", label: "Weight", type: "number", unit: "lbs" },
  ],

  electronics: [
    { key: "brand", label: "Brand", type: "text", searchable: true },
    { key: "model", label: "Model Number", type: "text", searchable: true },
    { key: "warranty", label: "Warranty", type: "text" },
    { key: "voltage", label: "Voltage", type: "number", unit: "V" },
    {
      key: "batteryLife",
      label: "Battery Life",
      type: "number",
      unit: "hours",
    },
    {
      key: "connectivity",
      label: "Connectivity",
      type: "multiselect",
      options: ["WiFi", "Bluetooth", "USB-C", "HDMI"],
    },
    { key: "color", label: "Color", type: "color" },
    { key: "waterproof", label: "Waterproof", type: "boolean" },
  ],

  clothing: [
    { key: "brand", label: "Brand", type: "text", searchable: true },
    {
      key: "size",
      label: "Size",
      type: "select",
      options: ["XS", "S", "M", "L", "XL", "XXL"],
    },
    { key: "color", label: "Color", type: "color" },
    { key: "material", label: "Material", type: "text" },
    {
      key: "fit",
      label: "Fit",
      type: "select",
      options: ["Slim", "Regular", "Loose", "Oversized"],
    },
    { key: "careInstructions", label: "Care Instructions", type: "text" },
    { key: "madeIn", label: "Made In", type: "text" },
    {
      key: "gender",
      label: "Gender",
      type: "select",
      options: ["Men", "Women", "Unisex"],
    },
  ],
};

export function getCategorySchema(slug: string): AttributeDefinition[] {
  return CATEGORY_SCHEMAS[slug] || [];
}
