import { api } from "./client";

export const categoryService = {
  async getCategories() {
    const response = await api.get("/category");
    return response.data.data;
  },

  async getCategory(id: string) {
    const response = await api.get(`/category/${id}`);
    return response.data;
  },

  async getCategoryBySlug(slug: string) {
    const response = await api.get(`/category/slug/${slug}`);
    return response.data;
  },
};
