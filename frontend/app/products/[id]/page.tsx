// src/app/products/[id]/page.tsx
import { serverProductService } from "@/lib/server-api";
import ProductDetailsClient from "./product-detail-client";

interface ProductDetailsPageProps {
  params: { id: string };
}

// This is now a Server Component
export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { id } = params;
  const product = await serverProductService.getProduct(id);

  return (
    <div className="min-h-full bg-gray-50">
      <ProductDetailsClient product={product} />
    </div>
  );
}
