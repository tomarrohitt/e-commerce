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

function normalizeBody(
  body: SmartBody,
  headers: HeadersInit | undefined,
): { body?: BodyInit; headers: HeadersInit } {
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
    return {
      body: JSON.stringify(body),
      headers: finalHeaders,
    };
  }

  return { body: body as BodyInit | undefined, headers: finalHeaders };
}
export async function baseApi<T>(
  endpoint: string,
  options: NextFetchOptions = {},
): Promise<T> {
  const { body, headers, ...rest } = options;

  const normalized = normalizeBody(body, headers);

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...rest, // includes next, cache, etc.
    credentials: "omit",
    body: normalized.body,
    headers: normalized.headers,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    throw data || { error: "No response from server" };
  }

  return data as T;
}
