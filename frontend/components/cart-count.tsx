import { getCartCount } from "@/lib/api";

export async function CartCount() {
  const { data } = await getCartCount();

  return (
    <>
      {data.count > 0 && (
        <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-lg animate-in zoom-in-50 duration-200">
          {data.count > 99 ? "99+" : data.count}
        </span>
      )}
    </>
  );
}
