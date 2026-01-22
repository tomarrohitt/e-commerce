"use client";
import CategoriesSection from "@/components/home/category-section";
import FeaturesSection from "@/components/home/feature-section";
import HeroSection from "@/components/home/hero-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <FeaturesSection />
    </>
  );
}
