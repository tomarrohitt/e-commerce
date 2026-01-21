import Image from "next/image";

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
      <div className="aspect-square bg-linear-to-br from-blue-400 to-indigo-500 rounded-2xl overflow-hidden mb-4">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={productName}
            className="object-cover"
            fill
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
                  ? "border-blue-500 scale-105"
                  : "border-gray-200 hover:border-blue-400"
              }`}
            >
              <Image
                src={image}
                alt={`${productName} ${index + 1}`}
                className="object-cover"
                fill
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
