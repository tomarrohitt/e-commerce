import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type SmartBody = BodyInit | Record<string, any> | null | undefined;

type NextFetchOptions = Omit<RequestInit, "body"> & {
  body?: SmartBody;
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
  cache?: RequestCache;
};

function normalizeBody(body: SmartBody, headers: HeadersInit | undefined) {
  const finalHeaders: Record<string, string> = {
    ...(headers as any),
  };

  if (
    body &&
    typeof body === "object" &&
    !(body instanceof FormData) &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer)
  ) {
    finalHeaders["Content-Type"] ||= "application/json";
    return { body: JSON.stringify(body), headers: finalHeaders };
  }

  return { body: body as BodyInit | undefined, headers: finalHeaders };
}
export async function api(endpoint: string, options: NextFetchOptions = {}) {
  const { body, headers, ...rest } = options;
  const { body: finalBody, headers: finalHeaders } = normalizeBody(
    body,
    headers,
  );

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  if (cookieHeader) finalHeaders["Cookie"] = cookieHeader;

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...rest,
    headers: finalHeaders,
    body: finalBody,
  });

  if (res.status === 401) {
    redirect("/sign-in");
  }

  return res;
}
