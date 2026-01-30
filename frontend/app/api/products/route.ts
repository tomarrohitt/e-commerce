import { getProducts } from "@/lib/services/product-cached";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const page = searchParams.get("page")
      ? Number(searchParams.get("page"))
      : undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const sortBy = searchParams.get("sortBy") as
      | "price"
      | "rating"
      | "createdAt"
      | undefined;
    const sortOrder = searchParams.get("sortOrder") as
      | "asc"
      | "desc"
      | undefined;
    const minPrice = searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined;
    const maxPrice = searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined;
    const search = searchParams.get("q") || undefined;

    const result = await getProducts({
      limit: 40,
      page,
      categoryId,
      sortBy,
      sortOrder,
      minPrice,
      maxPrice,
      search,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
