"use server";

import { api } from "@/lib/api/server";
import { refreshSession } from "@/lib/api/auth-server";

export const imageUpload = async (compressedBlob: Blob) => {
  const res = await api("/user/get-upload-url", {
    method: "POST",
  });

  if (!res.ok) {
    const err = await res.json();
    throw err;
  }

  const json = await res.json();
  if (!json.success) {
    throw new Error("Failed to get upload URL");
  }

  const { uploadUrl, fields } = json.data;

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

  const confirmRes = await api("/user/confirm-upload", {
    method: "POST",
    body: { key: fields.key },
  });

  if (!confirmRes.ok) {
    const err = await confirmRes.json();
    throw err;
  }

  await refreshSession();
};
