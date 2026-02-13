"use server";

import { api } from "@/lib/clients/server";
import { refreshSession } from "@/lib/services/auth-server";

export const getPreassignedUploadUrl = async (compressedBlob: Blob) => {
  const res = await api("/user/get-upload-url", {
    method: "POST",
  });

  if (!res.ok) {
    const err = await res.json();
    throw err;
  }

  const json = await res.json();

  const { uploadUrl, fields } = json.data;
  return { uploadUrl, fields };
};
export const confirmUpload = async (key: string) => {
  const confirmRes = await api("/user/confirm-upload", {
    method: "POST",
    body: { key },
  });

  if (!confirmRes.ok) {
    const err = await confirmRes.json();
    throw err;
  }

  await refreshSession();
};
