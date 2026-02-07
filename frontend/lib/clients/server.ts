import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

// 1. FORCE ABSOLUTE URL ON SERVER
// We prioritize SERVER_API_URL. If missing, we fallback to the hardcoded backend.
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://rohit-ecommerce-microservice.dedyn.io/api";

// 2. FORCE PUBLIC ORIGIN
// This is the URL of your FRONTEND (Vercel). The Backend expects this in the "Origin" header.
const DEFAULT_ORIGIN =
  process.env.NEXT_PUBLIC_ORIGIN_URL ||
  "https://rohit-ecommerce-microservice.vercel.app";

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
  const { body, headers: optionHeaders, ...rest } = options;

  const { body: finalBody, headers: finalHeaders } = normalizeBody(
    body,
    optionHeaders,
  );

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  if (cookieHeader) {
    finalHeaders["Cookie"] = cookieHeader;
  }

  // --- ORIGIN LOGIC FIXED ---
  const headersList = await headers();
  const incomingOrigin = headersList.get("origin");

  // Priority:
  // 1. Browser's real origin (if available)
  // 2. APP_URL from env
  // 3. Hardcoded Vercel domain (Fallback)
  const origin =
    incomingOrigin || process.env.NEXT_PUBLIC_APP_URL || DEFAULT_ORIGIN;

  if (origin) {
    finalHeaders["Origin"] = origin;
  }
  // --------------------------

  // --- URL LOGIC FIXED ---
  // Ensure we don't double-slash. If endpoint is "/auth...", fullUrl is "https://.../api/auth..."
  // (Assuming BASE_URL ends in /api)
  const fullUrl = `${BASE_URL}${endpoint}`;

  console.log(`[API Request] ${fullUrl} | Origin: ${origin}`); // Debug log

  const res = await fetch(fullUrl, {
    ...rest,
    headers: finalHeaders,
    body: finalBody,
  });

  if (res.status === 401) {
    redirect("/sign-in");
  }

  return res;
}
