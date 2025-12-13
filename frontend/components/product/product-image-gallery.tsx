interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  selectedImage: number;
  onSelectImage: (index: number) => void;
}

export function ProductImageGallery({
  images,
  productName,
  selectedImage,
  onSelectImage,
}: ProductImageGalleryProps) {
  const mainImage = images[selectedImage] || images[0];

  return (
    <div>
      <div className="aspect-square bg-linear-to-br from-purple-400 to-indigo-600 rounded-2xl overflow-hidden mb-4">
        {mainImage ? (
          <img
            src={mainImage}
            alt={productName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white text-9xl">📦</span>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => onSelectImage(index)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                selectedImage === index
                  ? "border-purple-600 scale-105"
                  : "border-gray-200 hover:border-purple-400"
              }`}
            >
              <img
                src={image}
                alt={`${productName} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
