export type ProductFilterType = {
  page: number;
  limit: number;
  search?: string;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: string;
};
