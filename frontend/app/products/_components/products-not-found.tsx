import { Search, Package } from "lucide-react";

const ProductsNotFound = ({
  title = "No Products Found",
  description = "We couldn't find any products matching your search criteria. Try adjusting your filters or search terms.",
}) => {
  return (
    <div className="flex items-center justify-center min-h-100 p-8">
      <div className="text-center max-w-lg">
        <IconContainer />

        <h2 className="text-3xl font-bold text-gray-900 mb-3">{title}</h2>

        <p className="text-gray-600 text-lg mb-6 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

const IconContainer = () => (
  <div className="relative mb-8 inline-block">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-32 h-32 bg-sky-100 rounded-full animate-ping opacity-20" />
    </div>
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-24 h-24 bg-sky-200 rounded-full animate-pulse" />
    </div>

    <div className="relative bg-linear-to-br from-sky-500 to-sky-700 w-28 h-28 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300 rotate-6 hover:rotate-0">
      <Package className="w-14 h-14 text-white" strokeWidth={1.5} />
    </div>

    <div className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg border-2 border-sky-600 animate-bounce">
      <Search className="w-5 h-5 text-sky-600" strokeWidth={2.5} />
    </div>
  </div>
);

export default ProductsNotFound;
