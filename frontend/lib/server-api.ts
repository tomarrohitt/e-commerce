import type { Category, Product } from "@/types";
import { notFound } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const serverCategoryService = {
  async getCategories(): Promise<{ categories: Category[] }> {
    try {
      const res = await fetch(`${API_URL}/category`, {
        /* ... */
      });

      if (!res.ok) {
        console.error(`Failed to fetch categories: ${res.statusText}`);
        return { categories: [] }; // <-- PROBLEM HERE
      }
      return res.json();
    } catch (error) {
      console.error("Error in getCategories:", error);
      return { categories: [] }; // <-- OR PROBLEM HERE
    }
  },
};

export const serverProductService = {
  /**
   * Get a single product by ID.
   * FOR SERVER COMPONENT USE ONLY.
   */
  async getProduct(id: string): Promise<Product> {
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Cache for 5 minutes (300 seconds)
        next: { revalidate: 300 },
      });

      if (!res.ok) {
        if (res.status === 404) {
          notFound(); // Triggers the not-found.tsx page
        }
        throw new Error(`Failed to fetch product: ${res.statusText}`);
      }

      return res.json();
    } catch (error) {
      console.error("Error in serverProductService.getProduct:", error);
      notFound(); // Show 404 on any error
    }
  },
};
