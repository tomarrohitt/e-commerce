"use client";
import { useState, useTransition } from "react";
import { Camera } from "lucide-react";
import { User } from "@/types";
import { ImageCropModal } from "./image-crop-modal";
import { imageUpload } from "@/actions/user";
import { getImageUrl } from "@/lib/constants/get-image-url";
import { useRouter } from "next/navigation";
import Image from "next/image";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const ProfilePicture = ({ user }: { user: User }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);

  const [optimisticImage, setOptimisticImage] = useState<string | null>(null);

  const [pending, startTransition] = useTransition();

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (compressedBlob: Blob) => {
    const previewUrl = URL.createObjectURL(compressedBlob);
    setOptimisticImage(previewUrl);

    startTransition(async () => {
      try {
        await imageUpload(compressedBlob);
      } catch (error) {
        console.error("Upload failed", error);
        setOptimisticImage(null);
      }
    });
  };

  const displayUrl =
    optimisticImage || (user.image ? getImageUrl(user.image) : null);

  return (
    <>
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-linear-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-xl">
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt={user.name}
              fill
              key={displayUrl}
              className="rounded-full"
              sizes="128px"
            />
          ) : (
            <span className="text-white text-4xl font-bold">
              {getInitials(user.name)}
            </span>
          )}
        </div>

        <button
          onClick={() => document.getElementById("profile-pic-input")?.click()}
          disabled={pending}
          className="absolute bottom-0 right-0 w-10 h-10 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Camera className="w-5 h-5 text-white" />
          )}
        </button>

        <input
          id="profile-pic-input"
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>

      {imageSrc && (
        <ImageCropModal
          open={showCropModal}
          onClose={() => setShowCropModal(false)}
          imageSrc={imageSrc}
          onCropComplete={handleCropComplete}
        />
      )}
    </>
  );
};
