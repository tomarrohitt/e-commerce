import ProductFeaturePage from "@/components/pages/product-feature-page";
import { SignUpBanner } from "@/components/sign-up-banner";

export default async function HomePage() {
  return (
    <div className="min-h-full bg-gray-50">
      <ProductFeaturePage />
      <SignUpBanner />
    </div>
  );
}
