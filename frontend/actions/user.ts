"use server";

import { api } from "@/lib/clients/server";
import { refreshSession } from "@/lib/services/auth-server";

export const imageUpload = async (compressedBlob: Blob) => {
  const res = await api("/user/get-upload-url", {
    method: "POST",
  });

  if (!res.ok) {
    const err = await res.json();
    throw err;
  }

  const json = await res.json();

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

  const uploadJson = await uploadResponse.json();
  console.log({ uploadResponse, uploadJson });

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
