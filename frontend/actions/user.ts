"use server";

import api from "@/lib/api";
import { refreshSession } from "@/lib/api/auth-server";
import { refresh } from "next/cache";

export const imageUpload = async (compressedBlob: Blob) => {
  const res = await api.post("/user/get-upload-url");
  if (!res.data.success) {
    throw new Error("Failed to get upload URL");
  }
  const { uploadUrl, fields } = res.data.data;
  const formData = new FormData();
  Object.keys(fields).forEach((key) => {
    formData.append(key, fields[key]);
  });
  formData.append("file", compressedBlob, "profile.webp");
  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });
  if (!uploadResponse.ok) {
    throw new Error("Failed to upload to S3");
  }
  await api.post("/user/confirm-upload", { key: fields.key });
  await refreshSession();
  refresh();
};
