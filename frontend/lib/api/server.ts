import axios, { AxiosInstance } from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 1. Create the Axios Instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. Request Interceptor: Attach Cookies
api.interceptors.request.use(
  async (config) => {
    // We must await cookies() in Server Components
    const cookieStore = await cookies();

    // Convert cookie store to a header string (e.g., "token=abc; session=xyz")
    const cookieHeader = cookieStore.toString();

    if (cookieHeader) {
      config.headers.Cookie = cookieHeader;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export async function serverApi<T = any>(
  fn: (instance: AxiosInstance) => Promise<T>,
): Promise<T> {
  try {
    const response = await fn(api);
    return response as T; // Axios usually returns { data: ... }, adjust based on your needs
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        // This is safe here because it runs outside the Axios internal stack
        redirect("/sign-in");
      }
    }
    // Re-throw other errors so your page can handle 404s or 500s
    throw error;
  }
}

export default api;
